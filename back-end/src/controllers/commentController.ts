/**
 * CONTROLLER: commentController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến Bình luận (CRUD, Reply, Soft Delete).
 * * Nguyên tắc áp dụng: HOF, Type Safety, Atomic Updates, Data Integrity.
 */
import { Request, Response } from "express";
import { Types } from "mongoose";
import Comment, { IComment } from "../models/Comment";
import Post from "../models/Post";
import Like from "../models/Like";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../utils/asyncHandler";
import { paginate, paginateAggregation } from "../utils/pagination";
import { buildCommentAggregationPipeline } from "../services/commentPipeline";
import { buildCommentFilter } from "../services/commentFilter";
import { addJobToQueue } from "../services/jobQueue"; // IMPORT JOB QUEUE
import {
  CommentParams,
  CreateCommentBody,
  GetCommentsQuery,
} from "../types/comment";

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

    const trimmedContent = content ? content.trim() : "";

    if (!postId || !trimmedContent) {
      return res
        .status(400)
        .json({ error: "Post ID and content are required." });
    }
    if (!Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid Post ID format." });
    }

    const post = await Post.findById(postId);
    if (!post || post.status !== "approved" || post.is_deleted) {
      return res
        .status(404)
        .json({ error: "Post not found or not available." });
    }

    let parentComment: IComment | null = null;
    let parentIdObj: Types.ObjectId | null = null;

    if (parentId) {
      if (!Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ error: "Invalid Parent ID format." });
      }

      parentComment = await Comment.findById(parentId);
      if (!parentComment || parentComment.is_deleted) {
        return res
          .status(404)
          .json({ error: "Parent comment not found or has been deleted." });
      }

      if (parentComment.postId.toString() !== postId) {
        return res
          .status(400)
          .json({ error: "Reply must belong to the same post as the parent." });
      }
      parentIdObj = parentComment._id as Types.ObjectId;
    }

    const newComment = await Comment.create({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
      parentId: parentIdObj,
      content: trimmedContent,
      status: "approved",
    });

    if (parentComment) {
      addCountJob(
        "Comment",
        (parentComment._id as Types.ObjectId).toString(),
        1
      );
    }

    if (!parentId) {
      addCountJob("Post", postId, 1);
    }

    res.status(201).json(newComment);
  }
);

// --- [ PUBLIC: Lấy danh sách Bình Luận ] ---
// FIX N+1 & Tách Filter
export const getComments = asyncHandler(
  async (req: Request<{}, {}, {}, GetCommentsQuery>, res: Response) => {
    const { page, limit } = req.query;
    // Logic xác định quyền hạn đã được chuyển vào Service Layer
    const authContext = { userId: undefined, isAdmin: false };

    // 1. XÂY DỰNG BỘ LỌC (Sử dụng Service mới)
    const filter = buildCommentFilter(req.query, authContext);
    if (filter.error) {
      return res.status(400).json({ error: filter.error });
    }

    // 2. TẠO AGGREGATION PIPELINE (FIX N+1)
    let pipeline = buildCommentAggregationPipeline(filter, {
      includeUser: true,
      includePost: false,
      includeParent: false,
      includeProjection: true,
    });

    // 3. GỌI HÀM AGGREGATION PHÂN TRANG
    const result = await paginateAggregation(Comment, pipeline, page, limit);

    res.json({
      comments: result.items,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      limit: result.limit,
    });
  }
);

// --- [ USER/ADMIN: Cập nhật Bình Luận ] ---
export const updateComment = asyncHandler(
  async (
    req: AuthenticatedRequest<CommentParams, {}, { content: string }>,
    res: Response
  ) => {
    const commentId = req.params.commentId;
    const userId = req.userId;
    const { content } = req.body;

    const trimmedContent = content ? content.trim() : "";

    if (!trimmedContent) {
      return res.status(400).json({ error: "Content is required for update." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted) {
      return res.status(404).json({ error: "Comment not found." });
    }

    const isAuthor = comment.userId.toString() === userId;
    const isAdmin = req.userRole === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Access denied. Only author or admin can update this comment.",
      });
    }

    comment.content = trimmedContent;
    comment.status = "approved";
    await comment.save();

    res.json(comment);
  }
);

// --- [ USER/ADMIN: Xóa Bình Luận (Soft Delete) ] ---
export const deleteComment = asyncHandler(
  async (req: AuthenticatedRequest<CommentParams>, res: Response) => {
    const commentId = req.params.commentId;
    const userId = req.userId;

    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted) {
      return res.status(404).json({ error: "Comment not found." });
    }

    const isAuthor = comment.userId.toString() === userId;
    const isAdmin = req.userRole === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Access denied. Only author or admin can delete this comment.",
      });
    }

    comment.is_deleted = true;
    comment.content = "[Bình luận này đã bị xóa.]";
    await comment.save();

    if (comment.parentId) {
      addCountJob("Comment", comment.parentId.toString(), -1);
    }

    if (!comment.parentId) {
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
    // Logic xác định quyền hạn
    const authContext = {
      userId: req.userId,
      isAdmin: req.userRole === "admin",
    };

    // 1. XÂY DỰNG BỘ LỌC (isAdmin: true)
    const filter = buildCommentFilter(req.query, authContext);
    if (filter.error) {
      return res.status(400).json({ error: filter.error });
    }

    // 2. TẠO AGGREGATION PIPELINE (FIX N+1)
    let pipeline = buildCommentAggregationPipeline(filter, {
      includeUser: true,
      includePost: true,
      includeParent: true,
      includeProjection: true,
    });

    // 3. GỌI HÀM AGGREGATION PHÂN TRANG
    const result = await paginateAggregation(Comment, pipeline, page, limit);

    res.json({
      comments: result.items,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      limit: result.limit,
    });
  }
);
