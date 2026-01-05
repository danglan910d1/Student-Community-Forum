/**
 * CONTROLLER: commentController
 * Trách nhiệm: Xử lý Business Logic liên quan đến Bình luận.
 * Nguyên tắc: Pipeline-driven, Job-based Counter, Atomic Updates.
 */
import { Request, Response } from "express";
import { Types } from "mongoose";
import Comment from "../models/Comment";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../utils/asyncHandler";
import { paginateAggregation } from "../utils/pagination";
import { buildCommentAggregationPipeline } from "../services/comments/commentPipeline";
import { buildCommentFilter } from "../services/comments/commentFilter";
import { addJobToQueue } from "../services/common/jobQueue";
import {
  CommentParams,
  CreateCommentBody,
  GetCommentsQuery,
} from "../types/comment";
import { AppError } from "../utils/appError";
import Post from "../models/Post";
import { NotificationType } from "../models/Notification";
import { createNotification } from "../services/notifications/notificationService";

/** * helper: Thêm Job đếm Comments/Replies vào Queue để xử lý bất đồng bộ
 */
const addCountJob = (
  targetType: "Post" | "Comment",
  targetId: string,
  increment: 1 | -1
) => {
  const jobName =
    targetType === "Post"
      ? "updatePostCommentCount"
      : "updateCommentReplyCount";
  addJobToQueue(jobName, {
    targetId,
    targetModelName: targetType,
    update: {
      $inc: {
        [targetType === "Post" ? "comments_count" : "replies_count"]: increment,
      },
    },
  });
};

// --- [ 1. READ OPERATIONS ] ---

/** * GET /api/comments (Public)
 * Lấy comment theo bài viết (thường dùng postId trong query)
 */
export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as GetCommentsQuery;

  // 1. Build Filter & Pipeline
  const filter = buildCommentFilter(query, {
    userId: undefined,
    isAdmin: false,
  });
  const pipeline = buildCommentAggregationPipeline(filter, {
    includeUser: true,
    includeProjection: true,
    isAdminView: false,
  });

  // 2. Phân trang và phản hồi
  const result = await paginateAggregation(
    Comment,
    pipeline,
    query.page,
    query.limit
  );
  res.json({
    comments: result.items,
    pagination: {
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      limit: result.limit,
    },
  });
});

/** * GET /api/comments/admin (Admin Only) */
export const getAllCommentsForAdmin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as GetCommentsQuery;

    const filter = buildCommentFilter(query, {
      userId: req.userId,
      isAdmin: true,
    });
    const pipeline = buildCommentAggregationPipeline(filter, {
      includeUser: true,
      includePost: true,
      includeParent: true,
      includeProjection: true,
      isAdminView: true,
    });

    const result = await paginateAggregation(
      Comment,
      pipeline,
      query.page,
      query.limit
    );
    res.json({
      comments: result.items,
      pagination: {
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: result.limit,
      },
    });
  }
);

// --- [ 2. WRITE OPERATIONS ] ---

/** * POST /api/comments (User) */
export const createComment = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, CreateCommentBody>,
    res: Response
  ) => {
    const { postId, parentId, content } = req.body;
    if (!postId || !content?.trim())
      throw new AppError(400, "Post ID and content are required.");

    const userId = req.userId!;
    // 1. Lưu DB
    const newComment = await Comment.create({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
      parentId: parentId ? new Types.ObjectId(parentId) : null,
      content: content.trim(),
      status: "approved",
    });

    // 2. Tìm thông tin bài viết để xác định chủ sở hữu (Recipient)
    // Lấy kèm userId của chủ bài viết
    const post = await Post.findById(postId).select("userId title");
    if (!post) throw new AppError(404, "Post not found.");

    // Mặc định thông báo gửi cho chủ bài viết
    let recipientId = post.userId;
    let type = NotificationType.NEW_COMMENT;
    let notificationContent = "đã bình luận về bài viết của bạn.";

    // 3. Xử lý logic nếu là phản hồi (Reply)
    if (parentId) {
      const parentComment = await Comment.findById(parentId).select("userId");
      if (parentComment) {
        // Nếu là reply, người nhận thông báo là chủ của bình luận cha
        recipientId = parentComment.userId;
        type = NotificationType.NEW_REPLY;
        notificationContent = "đã trả lời bình luận của bạn.";
      }
    }

    // 4. GỬI THÔNG BÁO
    // Hàm createNotification đã có logic chặn tự gửi cho chính mình (recipientId === senderId)
    await createNotification({
      recipientId: recipientId as Types.ObjectId, // Ép kiểu để tránh báo đỏ
      senderId: userId,
      type,
      entityId: post._id as Types.ObjectId, // Click vào thông báo dẫn về bài viết
      entityType: "post",
      content: notificationContent,
    });

    // 2. Chạy Job tăng count ngầm
    parentId
      ? addCountJob("Comment", parentId.toString(), 1)
      : addCountJob("Post", postId, 1);

    // 3. Trả về format chuẩn qua Pipeline
    const commentArray = await Comment.aggregate(
      buildCommentAggregationPipeline(
        { _id: newComment._id },
        { includeUser: true, includeProjection: true }
      )
    );

    res.status(201).json(commentArray[0]);
  }
);

/** * PUT /api/comments/:commentId (Author/Admin) */
export const updateComment = asyncHandler(
  async (
    req: AuthenticatedRequest<CommentParams, {}, { content: string }>,
    res: Response
  ) => {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted)
      throw new AppError(404, "Comment not found.");

    // RBAC: Chỉ tác giả hoặc Admin mới được sửa
    if (comment.userId.toString() !== req.userId && req.userRole !== "admin") {
      throw new AppError(403, "Permission denied.");
    }

    const updatedComment = await Comment.findOneAndUpdate(
      { _id: commentId },
      { $set: { content: content.trim(), status: "approved" } },
      { new: true }
    );

    const commentArray = await Comment.aggregate(
      buildCommentAggregationPipeline(
        { _id: updatedComment!._id },
        { includeUser: true, includeProjection: true }
      )
    );
    res.json(commentArray[0]);
  }
);

// --- [ 3. DELETE & RESTORE ] ---

/** * DELETE /api/comments/:commentId (Author/Admin) */
export const deleteComment = asyncHandler(
  async (req: AuthenticatedRequest<CommentParams>, res: Response) => {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted)
      throw new AppError(404, "Comment not found.");

    if (comment.userId.toString() !== req.userId && req.userRole !== "admin") {
      throw new AppError(403, "Permission denied.");
    }

    // Soft delete
    await Comment.updateOne({ _id: commentId }, { $set: { is_deleted: true } });

    // Giảm count ngầm
    comment.parentId
      ? addCountJob("Comment", comment.parentId.toString(), -1)
      : addCountJob("Post", comment.postId.toString(), -1);

    res.json({ message: "Comment deleted successfully." });
  }
);

/** * PUT /api/comments/admin/restore/:commentId (Admin Only) */
export const restoreComment = asyncHandler(
  async (req: AuthenticatedRequest<CommentParams>, res: Response) => {
    const { commentId } = req.params;

    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, is_deleted: true },
      { $set: { is_deleted: false } },
      { new: true }
    );

    if (!comment) throw new AppError(404, "Comment not found in trash.");

    // Tăng lại count
    comment.parentId
      ? addCountJob("Comment", comment.parentId.toString(), 1)
      : addCountJob("Post", comment.postId.toString(), 1);

    res.json({ message: "Comment restored successfully." });
  }
);
