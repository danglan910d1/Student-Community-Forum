/**
 * CONTROLLER: postController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến Bài viết (CRUD, Kiểm duyệt, Tương tác).
 * * Nguyên tắc áp dụng: HOF, Type Safety, RBAC Logic, Data Integrity.
 */
import { Request, Response } from "express";
import Post, { IPost, PostStatus } from "../models/Post";
import Topic from "../models/Topic";
import Comment from "../models/Comment";
import Like from "../models/Like";
import { AuthenticatedRequest } from "../types/express";
import { Types } from "mongoose";
import {
  PostParams,
  CreatePostBody,
  GetPostsQuery,
  UpdatePostBody,
} from "../types/post";
import { asyncHandler } from "../utils/asyncHandler";
import { paginate } from "../utils/pagination";
import { processTags } from "../services/tagLayer";
import { generateSlug } from "../utils/text";
import { buildPostFilter } from "../services/postFilter";

// --- [ USER: Tạo Bài Viết Mới ] ---
// Cần authMiddleware
// Endpoint: POST /api/posts
export const createPost = asyncHandler(
  async (req: AuthenticatedRequest<{}, {}, CreatePostBody>, res: Response) => {
    // 1. Lấy dữ liệu
    const { topicId, tags, title, content } = req.body;
    const userId = req.userId;
    const userObjectId = new Types.ObjectId(userId);

    // 2. Kiểm tra tính hợp lệ cơ bản
    if (!topicId || !title || !content) {
      return res
        .status(400)
        .json({ error: "Topic ID, Title, and Content are required." });
    }

    // 3. Xác minh Topic tồn tại và đã được Approved
    const topic = await Topic.findOne({
      _id: topicId,
      status: "approved",
    });
    if (!topic) {
      return res.status(404).json({ error: "Invalid or unapproved Topic." });
    }
    const topicObjectId = topic._id as Types.ObjectId;

    // --- 3. PHÂN LOẠI INPUTS VÀ XỬ LÝ TAGS (GỌI SERVICE) ---
    const { validTagIds, pendingTagIds } = await processTags(
      tags || [],
      userId,
      topicObjectId
    );

    const slug = generateSlug(title);

    // 5. Tạo bài viết
    const newPost = await Post.create({
      userId: userObjectId,
      topicId: topicObjectId,
      tags: validTagIds,
      pending_tags: pendingTagIds,
      title,
      slug,
      content,
      status: "pending", // QUY TẮC: Mặc định chờ duyệt
      is_sticky: false,
    });

    res.status(201).json(newPost);
  }
);

// --- [ PUBLIC/ADMIN: Lấy danh sách Bài Viết ] ---
// Hỗ trợ phân trang, lọc theo Topic, Tag và STATUS
// Endpoint: GET /api/posts
export const getPosts = asyncHandler(
  async (
    req:
      | Request<{}, {}, {}, GetPostsQuery>
      | AuthenticatedRequest<{}, {}, {}, GetPostsQuery>,
    res: Response
  ) => {
    // 1. Lấy tham số query và quyền hạn (Zero-Lookup)
    const { page, limit } = req.query;
    const userId = "userId" in req ? req.userId : undefined;
    const isAdmin = "userRole" in req ? req.userRole === "admin" : false;

    // 2. XÂY DỰNG BỘ LỌC (Ủy quyền cho Service Layer)
    const filter = buildPostFilter(req.query, { userId, isAdmin });

    // 3. GỌI HÀM TIỆN ÍCH PHÂN TRANG (Loại bỏ logic tính toán lặp lại)
    const result = await paginate(
      Post,
      filter,
      { is_sticky: -1, createdAt: -1 }, // Ưu tiên bài ghim, sau đó là bài mới nhất
      page,
      limit,
      null,
      [
        // Populate fields
        // { path: "userId", select: "username avatarUrl" },
        // { path: "topic", select: "name slug" },
        // { path: "tags", select: "name" },
      ]
    );

    // 4. Phản hồi kèm thông tin phân trang
    res.json({
      posts: result.items,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      limit: result.limit,
    });
  }
);

// --- [ PUBLIC: Lấy chi tiết Bài Viết và tăng Views ] ---
// Endpoint: GET /api/posts/:id
export const getPostById = asyncHandler(
  async (req: Request<PostParams>, res: Response) => {
    const { id } = req.params;

    // BỔ SUNG: Kiểm tra ID hợp lệ
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Post ID format." });
    }

    // 1. Tìm Bài viết APPROVED VÀ Tăng views_count
    const post = await Post.findOneAndUpdate(
      { _id: id, status: "approved" },
      { $inc: { views_count: 1 } }, // Tăng views_count lên 1 (atomic update)
      { new: true } // Trả về tài liệu sau khi cập nhật
    )
      .populate("userId", "name avatar")
      .populate("topicId", "name slug")
      .populate("tags", "name");

    if (!post) {
      return res.status(404).json({ error: "Post not found or not approved." });
    }

    // 2. Phản hồi thành công
    res.json(post);
  }
);

// --- [ ADMIN: Lấy chi tiết Bài Viết Bất kể Status ] ---
// Cần authMiddleware & adminMiddleware
export const getPostByIdForAdmin = asyncHandler(
  async (req: AuthenticatedRequest<PostParams>, res: Response) => {
    const { id } = req.params;

    // 1. Kiểm tra tính hợp lệ của ID
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Post ID format." });
    }

    // 2. Tìm Bài viết chỉ bằng ID (KHÔNG lọc theo status)
    const post = await Post.findById(id)
      .populate("userId", "name avatar")
      .populate("topicId", "name slug")
      .populate("tags", "name");

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // 3. Phản hồi thành công
    res.json(post);
  }
);

// --- [ USER/ADMIN: Cập nhật Bài Viết ] ---
// Cần authMiddleware (User chỉ sửa bài của mình, Admin sửa bài bất kỳ)
// Endpoint: PUT /api/posts/:id
export const updatePost = asyncHandler(
  async (
    req: AuthenticatedRequest<PostParams, {}, UpdatePostBody>,
    res: Response
  ) => {
    const postId = req.params.id;
    const userId = req.userId;
    const { topicId, tags, title, content, status, is_sticky } = req.body;

    if (!Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid Post ID format." });
    }

    // 1. Tìm bài viết hiện có
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // 2. KIỂM TRA QUYỀN HẠN
    const isAuthor = post.userId.toString() === userId;
    const isAdmin = req.userRole === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Access denied. Only author or admin can update this post.",
      });
    }

    const updateFields: Partial<IPost> = {};
    let finalTopicId: Types.ObjectId = post.topicId; // Khởi tạo bằng ID hiện tại
    let shouldSetStatusToPending = false;

    // 3. LOGIC XỬ LÝ NỘI DUNG (Content, Title, Topic)

    // 3.1. Xử lý Tiêu đề & Nội dung
    if (title && title.trim() !== post.title) {
      updateFields.title = title.trim();
      shouldSetStatusToPending = true;
      // SỬA LỖI SLUG: Buộc Controller tạo slug nếu title thay đổi
      // Lý do: đảm bảo slug được cập nhật ngay lập tức và tránh lỗi bị bỏ qua hook findByIdAndUpdate
      updateFields.slug = generateSlug(title.trim());
    }
    if (content && content.trim() !== post.content) {
      updateFields.content = content.trim();
      shouldSetStatusToPending = true;
    }

    // 3.2. Xử lý Topic (Nếu có)
    if (topicId) {
      if (!Types.ObjectId.isValid(topicId)) {
        return res.status(400).json({ error: "Invalid Topic ID format." });
      }
      const topic = await Topic.findOne({ _id: topicId, status: "approved" });
      if (!topic) {
        return res
          .status(400)
          .json({ error: "Invalid or unapproved Topic ID." });
      }

      const topicObjectId = topic._id as Types.ObjectId;

      // SỬA LỖI MONGODB: Dùng .equals() để so sánh ObjectId
      if (!post.topicId.equals(topicObjectId)) {
        finalTopicId = topicObjectId;
        shouldSetStatusToPending = true;
      }
    }

    // 3.3. Xử lý Tags (Tái sử dụng Service Tag Đề xuất)
    if (tags) {
      const { validTagIds, pendingTagIds } = await processTags(
        tags,
        userId,
        finalTopicId
      );
      updateFields.tags = validTagIds;
      updateFields.pending_tags = pendingTagIds;
      shouldSetStatusToPending = true;
    }

    // 4. KIỂM TRA QUYỀN VÀ XÁC LẬP STATUS CUỐI CÙNG

    // 4.1. ADMIN ACTIONS (Quyền lực tối cao)
    if (isAdmin) {
      if (status) updateFields.status = status;
      if (is_sticky !== undefined) updateFields.is_sticky = is_sticky;

      if (status === "approved" || status === "rejected") {
        shouldSetStatusToPending = false; // Admin đã quyết định status thủ công
      }
    }

    // 4.2. USER (AUTHOR) ACTIONS
    if (isAuthor) {
      // User KHÔNG CÓ quyền thay đổi status hoặc is_sticky
      if (status || is_sticky !== undefined) {
        return res.status(403).json({
          error: "Users cannot directly change post status or stickiness.",
        });
      }

      // Nếu User thay đổi bất kỳ trường nào cần duyệt lại VÀ Admin chưa quyết định status
      if (shouldSetStatusToPending) {
        updateFields.status = "pending";
      }
    }

    // 4.3. HOÀN THIỆN PAYLOAD
    // SỬA LỖI MONGODB: Dùng .equals() để so sánh ObjectId
    if (!post.topicId.equals(finalTopicId)) {
      updateFields.topicId = finalTopicId;
    }

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update." });
    }

    // 5. Thực hiện cập nhật
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    ).populate("tags", "name");

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found after update." });
    }

    res.json(updatedPost);
  }
);

// --- [ USER/ADMIN: Xóa Bài Viết ] ---
// Cần authMiddleware (User chỉ xóa bài của mình, Admin xóa bài bất kỳ)
// Endpoint: DELETE /api/posts/:id
export const deletePost = asyncHandler(
  async (req: AuthenticatedRequest<PostParams>, res: Response) => {
    const postId = req.params.id;
    const userId = req.userId;

    // BỔ SUNG: Kiểm tra ID hợp lệ
    if (!Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid Post ID format." });
    }

    // 1. Tìm bài viết hiện có
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // 2. KIỂM TRA QUYỀN HẠN
    const isAuthor = post.userId.toString() === userId;
    const isAdmin = req.userRole === "admin";

    // Nếu không phải tác giả VÀ không phải admin -> Từ chối
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Access denied. Only author or admin can delete this post.",
      });
    }

    // 3. Thực hiện xóa
    await post.deleteOne();

    // 4. XÓA DỮ LIỆU LIÊN QUAN (Data Integrity - BẮT BUỘC)
    // Xóa tất cả Comments và Likes liên quan đến Post này
    await Comment.deleteMany({ postId: postId });
    await Like.deleteMany({ targetId: postId, targetType: "post" });

    res.json({ message: "Post deleted successfully." });
  }
);
