/**
 * CONTROLLER: commentController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến Bình luận (CRUD, Reply, Soft Delete).
 * * Nguyên tắc áp dụng: HOF, Type Safety, Atomic Updates, Data Integrity.
 */
import { Request, Response } from "express";
import { Types } from "mongoose";
import Comment, { IComment } from "../models/Comment"; // Import IComment
import Post from "../models/Post";
import Like from "../models/Like";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../utils/asyncHandler"; // HOF
import { paginate } from "../utils/pagination"; // Tiện ích phân trang
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "../config/constants"; // Hằng số
// Import Interfaces từ file Types API
import {
  CommentParams,
  CreateCommentBody,
  GetCommentsQuery,
} from "../types/comment";

// --- [ USER: Tạo Bình Luận Mới ] ---
export const createComment = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, CreateCommentBody>,
    res: Response
  ) => {
    const { postId, parentId, content } = req.body;
    const userId = req.userId;

    // BỔ SUNG: Làm sạch nội dung
    const trimmedContent = content ? content.trim() : ""; // 1. Kiểm tra tính hợp lệ cơ bản

    if (!postId || !trimmedContent) {
      return res
        .status(400)
        .json({ error: "Post ID and content are required." });
    }
    if (!Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid Post ID format." });
    } // 2. Xác minh Post tồn tại

    const post = await Post.findById(postId); // LƯU Ý: Post có is_deleted nên cần kiểm tra ở đây để tránh lỗi like controller
    if (!post || post.status !== "approved" || post.is_deleted) {
      return res
        .status(404)
        .json({ error: "Post not found or not available." });
    }

    let parentComment: IComment | null = null;
    let parentIdObj: Types.ObjectId | null = null; // 3. Xử lý Reply (Bình luận đa cấp)

    if (parentId) {
      if (!Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ error: "Invalid Parent ID format." });
      }

      parentComment = await Comment.findById(parentId);
      if (!parentComment || parentComment.is_deleted) {
        return res
          .status(404)
          .json({ error: "Parent comment not found or has been deleted." });
      } // Đảm bảo bình luận con phải cùng một bài viết

      if (parentComment.postId.toString() !== postId) {
        return res
          .status(400)
          .json({ error: "Reply must belong to the same post as the parent." });
      }
      parentIdObj = parentComment._id as Types.ObjectId;
    } // 4. Tạo bình luận

    const newComment = await Comment.create({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
      parentId: parentIdObj,
      content: trimmedContent,
      status: "approved",
    }); // 5. Cập nhật số lượng replies cho bình luận cha (nếu có)

    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment._id, {
        $inc: { replies_count: 1 },
      });
    } // 6. Chỉ tăng comments_count cho Post nếu là ROOT comment.

    if (!parentId) {
      await Post.findByIdAndUpdate(postId, { $inc: { comments_count: 1 } });
    }

    res.status(201).json(newComment);
  }
);

// --- [ PUBLIC: Lấy danh sách Bình Luận ] ---
// API này được thiết kế để lấy bình luận cấp 1 (parentId=null) HOẶC replies (parentId=ID)
export const getComments = asyncHandler(
  async (req: Request<{}, {}, {}, GetCommentsQuery>, res: Response) => {
    const { postId, parentId, page, limit } = req.query;

    if (!postId || !Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Valid Post ID is required." });
    } // 1. Thiết lập bộ lọc (Business Logic)

    const filter: any = {
      postId: new Types.ObjectId(postId),
      is_deleted: false,
      status: "approved", // Chỉ lấy bình luận đã duyệt
    }; // 2. Lọc theo cấp độ (parentId)

    if (parentId) {
      if (!Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ error: "Invalid Parent ID format." });
      } // Lấy replies
      filter.parentId = new Types.ObjectId(parentId);
    } else {
      // Lấy bình luận cấp 1 (root comments)
      filter.parentId = null;
    } // 3. GỌI HÀM TIỆN ÍCH PHÂN TRANG (Loại bỏ logic tính toán lặp lại)

    const result = await paginate(
      Comment,
      filter,
      { createdAt: -1 }, // Sắp xếp bình luận mới nhất
      page,
      limit,
      null, // Select fields
      [{ path: "userId", select: "name avatar" }] // Populate userId
    ); // 4. Phản hồi

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
    } // 1. Tìm bình luận

    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted) {
      return res.status(404).json({ error: "Comment not found." });
    } // 2. KIỂM TRA QUYỀN HẠN

    const isAuthor = comment.userId.toString() === userId;
    const isAdmin = req.userRole === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Access denied. Only author or admin can update this comment.",
      });
    } // 3. Thực hiện cập nhật

    comment.content = trimmedContent;
    comment.status = "approved"; // Có thể thiết lập lại pending nếu cần kiểm duyệt lại
    await comment.save();

    res.json(comment);
  }
);

// --- [ USER/ADMIN: Xóa Bình Luận (Soft Delete) ] ---
export const deleteComment = asyncHandler(
  async (req: AuthenticatedRequest<CommentParams>, res: Response) => {
    const commentId = req.params.commentId;
    const userId = req.userId; // 1. Tìm bình luận

    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted) {
      return res.status(404).json({ error: "Comment not found." });
    } // 2. KIỂM TRA QUYỀN HẠN

    const isAuthor = comment.userId.toString() === userId;
    const isAdmin = req.userRole === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Access denied. Only author or admin can delete this comment.",
      });
    } // 3. Thực hiện Soft Delete

    comment.is_deleted = true;
    comment.content = "[Bình luận này đã bị xóa.]"; // Thay thế nội dung
    await comment.save(); // 4. Giảm replies_count của bình luận cha nếu đây là reply

    if (comment.parentId) {
      await Comment.findByIdAndUpdate(comment.parentId, {
        $inc: { replies_count: -1 },
      });
    } // 5. Giảm comments_count của Post nếu đây là bình luận cấp 1 (ROOT comment).

    if (!comment.parentId) {
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { comments_count: -1 },
      });
    }

    res.json({ message: "Comment deleted successfully." });
  }
);

// --- [ ADMIN: Lấy tất cả Comments (kể cả pending/deleted) ] ---
export const getAllCommentsForAdmin = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, {}, GetCommentsQuery>,
    res: Response
  ) => {
    const { postId, page, limit } = req.query;

    const filter: any = {};
    let populateFields: { path: string; select: string }[] = []; // Lọc theo Post ID (nếu cần)

    if (postId && Types.ObjectId.isValid(postId)) {
      filter.postId = new Types.ObjectId(postId);
    }

    // Admin có thể xem tất cả trạng thái, bao gồm cả is_deleted: true, nên không cần lọc is_deleted: false

    // Tạo populate fields
    populateFields = [
      { path: "userId", select: "name avatar" },
      { path: "postId", select: "title" },
      { path: "parentId", select: "content" },
    ]; // GỌI HÀM TIỆN ÍCH PHÂN TRANG

    const result = await paginate(
      Comment,
      filter,
      { createdAt: -1 }, // Sắp xếp bình luận mới nhất
      page,
      limit,
      null,
      populateFields
    ); // 4. Phản hồi

    res.json({
      comments: result.items,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      limit: result.limit,
    });
  }
);
