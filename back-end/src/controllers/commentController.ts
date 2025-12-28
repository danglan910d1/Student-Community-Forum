/**
 * CONTROLLER: commentController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến Bình luận (CRUD, Reply, Soft Delete).
 * * Nguyên tắc áp dụng: HOF, Type Safety, Atomic Updates, Data Integrity.
 */
import { Request, Response } from "express";
import { Types } from "mongoose";
import Comment from "../models/Comment";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../utils/asyncHandler";
import { paginateAggregation } from "../utils/pagination";
import { buildCommentAggregationPipeline } from "../services/comments/commentPipeline";
import { buildCommentFilter } from "../services/comments/commentFilter";
import { addJobToQueue } from "../services/common/jobQueue"; // IMPORT JOB QUEUE
import {
  CommentParams,
  CreateCommentBody,
  GetCommentsQuery,
} from "../types/comment";
import { AppError } from "../utils/appError";

// --- [ JOB PRODUCER: Thêm Job đếm Comments/Replies ] ---
// Tên model được truyền vào là 'Post' hoặc 'Comment'
const addCountJob = (
  ModelType: "Post" | "Comment",
  targetId: string,
  increment: 1 | -1
) => {
  let jobName = "";
  let update: any = {};
  let targetModelName: "Post" | "Comment" = ModelType;

  if (ModelType === "Post") {
    jobName = "updatePostCommentCount";
    update = { $inc: { comments_count: increment } };
  } else if (ModelType === "Comment") {
    jobName = "updateCommentReplyCount";
    update = { $inc: { replies_count: increment } };
  }

  if (jobName) {
    addJobToQueue(jobName, {
      targetId: targetId,
      targetModelName: targetModelName, // <-- TRUYỀN TÊN MODEL
      update: update,
    });
  }
};

// --- [ USER: Tạo Bình Luận Mới ] ---
export const createComment = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, CreateCommentBody>,
    res: Response
  ) => {
    const { postId, parentId, content } = req.body;
    const userId = req.userId;
    const trimmedContent = content?.trim();

    if (!postId || !trimmedContent)
      throw new AppError(400, "Post ID and content are required.");

    // 1. Tạo bản ghi thô (Raw)
    const newCommentRaw = await Comment.create({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
      parentId: parentId ? new Types.ObjectId(parentId) : null,
      content: trimmedContent,
      status: "approved",
    });

    // 2. TRẢ VỀ QUA PIPELINE (Đồng nhất với PostController)
    const commentArray = await Comment.aggregate(
      buildCommentAggregationPipeline(
        { _id: newCommentRaw._id },
        { includeUser: true, includeProjection: true }
      )
    );

    // 3. Chạy Job ngầm (Async)
    if (parentId) {
      addCountJob("Comment", parentId.toString(), 1);
    } else {
      addCountJob("Post", postId, 1);
    }

    res.status(201).json(commentArray[0]);
  }
);

// --- [ PUBLIC: Lấy danh sách Bình Luận ] ---
// FIX N+1 & Tách Filter
// --- [ PUBLIC: Lấy danh sách Bình Luận ] ---
export const getComments = asyncHandler(
  async (req: Request<{}, {}, {}, GetCommentsQuery>, res: Response) => {
    const { page, limit } = req.query;
    const authContext = { userId: undefined, isAdmin: false };

    const filter = buildCommentFilter(req.query, authContext);
    if (filter.error) throw new AppError(400, filter.error);

    const pipeline = buildCommentAggregationPipeline(filter, {
      includeUser: true,
      includeProjection: true,
    });

    const result = await paginateAggregation(Comment, pipeline, page, limit);
    res.json(result);
  }
);

// --- [ USER/ADMIN: Cập nhật Bình Luận ] ---
export const updateComment = asyncHandler(
  async (
    req: AuthenticatedRequest<CommentParams, {}, { content: string }>,
    res: Response
  ) => {
    const { commentId } = req.params;
    const { content } = req.body;

    // 1. Tìm và kiểm tra quyền (Giữ nguyên logic bảo mật)
    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted)
      throw new AppError(404, "Comment not found.");

    const isAuthor = comment.userId.toString() === req.userId;
    const isAdmin = req.userRole === "admin";
    if (!isAuthor && !isAdmin) throw new AppError(403, "Permission denied.");

    // 2. Cập nhật Atomic
    await Comment.updateOne(
      { _id: commentId },
      { $set: { content: content.trim(), status: "approved" } }
    );

    // 3. TRẢ VỀ QUA PIPELINE để đồng bộ dữ liệu Author/Stats cho FE
    const commentArray = await Comment.aggregate(
      buildCommentAggregationPipeline(
        { _id: new Types.ObjectId(commentId) },
        { includeUser: true, includeProjection: true }
      )
    );

    res.json(commentArray[0]);
  }
);
// --- [ USER/ADMIN: Xóa Bình Luận (Soft Delete) ] ---
export const deleteComment = asyncHandler(
  async (req: AuthenticatedRequest<CommentParams>, res: Response) => {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted)
      throw new AppError(404, "Comment not found.");

    const isAuthor = comment.userId.toString() === req.userId;
    const isAdmin = req.userRole === "admin";

    if (!isAuthor && !isAdmin) throw new AppError(403, "Permission denied.");

    comment.is_deleted = true;
    await comment.save();

    // Giảm count qua Job Queue
    if (comment.parentId) {
      addCountJob("Comment", comment.parentId.toString(), -1);
    } else {
      addCountJob("Post", comment.postId.toString(), -1);
    }

    res.json({ message: "Comment deleted successfully." });
  }
);

// --- [ ADMIN: Lấy tất cả Comments (kể cả pending/deleted) ] ---
// FIX N+1 & Tách Filter
export const getAllCommentsForAdmin = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, {}, GetCommentsQuery>,
    res: Response
  ) => {
    const { page, limit } = req.query;
    const authContext = { userId: req.userId, isAdmin: true };

    const filter = buildCommentFilter(req.query, authContext);
    if (filter.error) throw new AppError(400, filter.error);

    const pipeline = buildCommentAggregationPipeline(filter, {
      includeUser: true,
      includePost: true,
      includeParent: true,
      includeProjection: true,
      isAdminView: true,
    });

    const result = await paginateAggregation(Comment, pipeline, page, limit);
    res.json(result);
  }
);

// Khôi phục lại comment đã xoá
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
    if (comment.parentId) {
      addCountJob("Comment", comment.parentId.toString(), 1);
    } else {
      addCountJob("Post", comment.postId.toString(), 1);
    }

    res.json({ message: "Comment restored successfully." });
  }
);
