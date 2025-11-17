import { Request, Response } from "express";
import { Types } from "mongoose";
import Comment from "../models/Comment";
import Post from "../models/Post";
import { AuthenticatedRequest } from "../types/express";

// Định nghĩa kiểu dữ liệu chung cho Params
interface CommentParams {
  commentId: string;
}

// Định nghĩa kiểu cho Tạo Bình luận
interface CreateCommentBody {
  postId: string; // ID của Bài viết (Bắt buộc)
  parentId?: string; // ID của Comment cha (Nếu là reply)
  content: string; // Nội dung
}

// Định nghĩa kiểu cho Lấy danh sách Bình luận
interface GetCommentsQuery {
  postId: string; // Bắt buộc khi gọi API
  parentId?: string; // ID của Comment cha (để lấy replies)
  page?: string;
  limit?: string;
}

// --- [ USER: Tạo Bình Luận Mới ] ---
export const createComment = async (
  req: AuthenticatedRequest<{}, {}, CreateCommentBody>,
  res: Response
) => {
  try {
    const { postId, parentId, content } = req.body;
    const userId = req.userId;

    // 1. Kiểm tra tính hợp lệ cơ bản
    if (!postId || !content) {
      return res
        .status(400)
        .json({ error: "Post ID and content are required." });
    }
    if (!Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid Post ID format." });
    }

    // 2. Xác minh Post tồn tại
    const post = await Post.findById(postId);
    if (!post || post.status !== "approved") {
      return res.status(404).json({ error: "Post not found or not approved." });
    }

    let parentComment = null;
    let parentIdObj: Types.ObjectId | null = null;

    // 3. Xử lý Reply (Bình luận đa cấp)
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

      // Đảm bảo bình luận con phải cùng một bài viết
      if (parentComment.postId.toString() !== postId) {
        return res
          .status(400)
          .json({ error: "Reply must belong to the same post as the parent." });
      }
      // Ép kiểu tường minh thành Types.ObjectId
      parentIdObj = parentComment._id as Types.ObjectId;
    }

    // 4. Tạo bình luận
    const newComment = await Comment.create({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
      parentId: parentIdObj,
      content,
      status: "approved", // Mặc định duyệt tự động
    });

    // 5. Cập nhật số lượng replies cho bình luận cha (nếu có)
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment._id, {
        $inc: { replies_count: 1 },
      });
    } // Điều này đảm bảo Post.comments_count chỉ đếm bình luận cấp 1.

    // 6. Chỉ tăng comments_count cho Post nếu là ROOT comment.
    if (!parentId) {
      await Post.findByIdAndUpdate(postId, { $inc: { comments_count: 1 } });
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during comment creation." });
  }
};

// --- [ PUBLIC: Lấy danh sách Bình Luận ] ---
// API này được thiết kế để lấy bình luận cấp 1 (parentId=null) HOẶC replies (parentId=ID)
export const getComments = async (
  req: Request<{}, {}, {}, GetCommentsQuery>,
  res: Response
) => {
  try {
    const { postId, parentId, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    if (!postId || !Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Valid Post ID is required." });
    }

    const skip = (pageNum - 1) * limitNum;

    // 1. Thiết lập bộ lọc
    const filter: any = {
      postId: new Types.ObjectId(postId),
      is_deleted: false,
      status: "approved", // Chỉ lấy bình luận đã duyệt
    };

    // 2. Lọc theo cấp độ (parentId)
    if (parentId) {
      if (!Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ error: "Invalid Parent ID format." });
      }
      // Lấy replies
      filter.parentId = new Types.ObjectId(parentId);
    } else {
      // Lấy bình luận cấp 1 (root comments)
      filter.parentId = null;
    }

    // 3. Tính tổng số lượng
    const totalComments = await Comment.countDocuments(filter);

    // 4. Thực hiện truy vấn
    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 }) // Bình luận mới nhất lên đầu
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "name avatar"); // Hiển thị thông tin người dùng

    // 5. Phản hồi
    res.json({
      comments,
      currentPage: pageNum,
      totalPages: Math.ceil(totalComments / limitNum),
      totalItems: totalComments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during fetching comments." });
  }
};

// --- [ USER/ADMIN: Cập nhật Bình Luận ] ---
export const updateComment = async (
  req: AuthenticatedRequest<CommentParams, {}, { content: string }>,
  res: Response
) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.userId;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required for update." });
    }

    // 1. Tìm bình luận
    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted) {
      return res.status(404).json({ error: "Comment not found." });
    }

    // 2. KIỂM TRA QUYỀN HẠN
    const isAuthor = comment.userId.toString() === userId;
    // req.userRole được đảm bảo có sẵn sau khi qua adminMiddleware
    const isAdmin = req.userRole === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Access denied. Only author or admin can update this comment.",
      });
    }

    // 3. Thực hiện cập nhật
    comment.content = content;
    comment.status = "approved"; // Có thể thiết lập lại pending nếu cần kiểm duyệt lại
    await comment.save();

    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during comment update." });
  }
};

// --- [ USER/ADMIN: Xóa Bình Luận (Soft Delete) ] ---
export const deleteComment = async (
  req: AuthenticatedRequest<CommentParams>,
  res: Response
) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.userId;

    // 1. Tìm bình luận
    const comment = await Comment.findById(commentId);
    if (!comment || comment.is_deleted) {
      return res.status(404).json({ error: "Comment not found." });
    }

    // 2. KIỂM TRA QUYỀN HẠN
    const isAuthor = comment.userId.toString() === userId;
    // req.userRole được đảm bảo có sẵn sau khi qua adminMiddleware
    const isAdmin = req.userRole === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Access denied. Only author or admin can delete this comment.",
      });
    }

    // 3. Thực hiện Soft Delete
    comment.is_deleted = true;
    comment.content = "[Bình luận này đã bị xóa.]"; // Thay thế nội dung
    await comment.save();

    // 4. Giảm replies_count của bình luận cha nếu đây là reply
    if (comment.parentId) {
      await Comment.findByIdAndUpdate(comment.parentId, {
        $inc: { replies_count: -1 },
      });
    }

    //  5. Giảm comments_count của Post nếu đây là bình luận cấp 1.
    // Logic này giữ nguyên: chỉ giảm count nếu là ROOT comment.
    if (!comment.parentId) {
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { comments_count: -1 },
      });
    }

    res.json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during comment deletion." });
  }
};

// --- [ ADMIN: Lấy tất cả Comments (kể cả pending/deleted) ] ---
// Hàm này cho phép Admin xem và duyệt tất cả Comments
export const getAllCommentsForAdmin = async (
  req: AuthenticatedRequest<{}, {}, {}, GetCommentsQuery>,
  res: Response
) => {
  try {
    const { postId, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    // Lọc theo Post ID (nếu cần)
    if (postId && Types.ObjectId.isValid(postId)) {
      filter.postId = new Types.ObjectId(postId);
    }

    // Admin có thể xem tất cả trạng thái, bao gồm cả is_deleted: true
    // Nếu không có filter.is_deleted, Mongoose sẽ lấy cả hai.

    const totalComments = await Comment.countDocuments(filter);

    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "name avatar")
      .populate("postId", "title")
      .populate("parentId", "content"); // Để Admin xem ngữ cảnh

    res.json({
      comments,
      currentPage: pageNum,
      totalPages: Math.ceil(totalComments / limitNum),
      totalItems: totalComments,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Server error during fetching all comments for admin." });
  }
};
