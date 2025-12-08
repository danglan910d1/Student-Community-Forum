/**
 * CONTROLLER: postController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến Bài viết (CRUD, Kiểm duyệt, Tương tác).
 * * Nguyên tắc áp dụng: HOF, Type Safety, RBAC Logic, Data Integrity.
 */
import { Request, Response } from "express";
import Post, { IPost } from "../models/Post";
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
  AdminApprovePostBody,
  ToggleStickyBody,
} from "../types/post";
import { asyncHandler } from "../utils/asyncHandler";
import { paginateAggregation } from "../utils/pagination";
import { processTags } from "../services/tags/tagLayer";
import { generateSlug } from "../utils/text";
import { buildPostFilter } from "../services/posts/postFilter";
import { adminApprovePost } from "../services/posts/adminApprovePost";
import { buildPostAggregationPipeline } from "../services/posts/postPipeline";
// import { addJobToQueue } from "../services/jobQueue"; // LOẠI BỎ JOB QUEUE MOCK
import {
  getCache,
  setCache,
  incrementPostView,
} from "../services/common/redis"; // Dùng service Redis mới

// --- [ JOB PRODUCER: Loại bỏ Job View Count ] ---
// Logic Views Count đã được chuyển sang Redis INCR.
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

    // Tạo khóa cache dựa trên TẤT CẢ query params và quyền Admin (chỉ public mới cache)
    const cacheKey = isAdmin ? null : `posts:list:${JSON.stringify(req.query)}`;

    if (cacheKey) {
      const cachedResult = await getCache(cacheKey);
      if (cachedResult) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json(cachedResult);
      }
    }

    // 2. XÂY DỰNG BỘ LỌC (Ủy quyền cho Service Layer)
    const filter = buildPostFilter(req.query, { userId, isAdmin });

    // 2. TẠO AGGREGATION PIPELINE (Tái sử dụng logic $lookup)
    let pipeline = buildPostAggregationPipeline(
      filter,
      {
        includeUser: true,
        includeTopic: true,
        includeTags: true,
        includeProjection: true,
      },
      isAdmin,
      userId
    );

    // 2.1 Thêm Stage sắp xếp sau Stage $project
    pipeline.push({ $sort: { is_sticky: -1, createdAt: -1 } });

    const result = await paginateAggregation(Post, pipeline, page, limit);
    // 4. Phản hồi kèm thông tin phân trang
    const responseData = {
      posts: result.items,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      limit: result.limit,
    };

    // 5. Lưu vào cache nếu là public view (5 phút TTL)
    if (cacheKey) {
      await setCache(cacheKey, responseData, 300);
    }

    res.json(responseData);
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

    // 1. TÌM BÀI VIẾT BẰNG AGGREGATION (FIX N+1)
    const postArray = await Post.aggregate([
      ...buildPostAggregationPipeline(
        { _id: new Types.ObjectId(id), status: "approved" },
        {
          includeUser: true,
          includeTopic: true,
          includeTags: true,
          includeProjection: true,
        },
        false,
        undefined
      ),
    ]).exec();

    const post = postArray[0];

    if (!post) {
      return res.status(404).json({ error: "Post not found or not approved." });
    }

    // 2. TÍCH HỢP REDIS: Tăng views_count bằng Redis INCR
    await incrementPostView(id); // <-- GỌI REDIS SERVICE MỚI

    // 3. Phản hồi thành công
    res.json(post);
  }
);

// --- [ ADMIN: Lấy chi tiết Bài Viết Bất kể Status ] ---
// Cần authMiddleware & adminMiddleware
export const getPostByIdForAdmin = asyncHandler(
  async (req: AuthenticatedRequest<PostParams>, res: Response) => {
    const { id } = req.params;
    const isAdmin = req.userRole === "admin";
    const callerId = req.userId;

    // 1. Kiểm tra tính hợp lệ của ID
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Post ID format." });
    }

    // 2. Tìm Bài viết chỉ bằng ID (KHÔNG lọc theo status)
    // 1. TÌM BÀI VIẾT BẰNG AGGREGATION (FIX N+1)
    const postArray = await Post.aggregate([
      ...buildPostAggregationPipeline(
        { _id: new Types.ObjectId(id) },
        {
          includeUser: true,
          includeTopic: true,
          includeTags: true,
          includeProjection: true,
        },
        isAdmin,
        callerId
      ),
    ]).exec();

    const post = postArray[0];

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // 3. Phản hồi thành công
    res.json(post);
  }
);

// --- [ ADMIN: Toggle is_sticky (Atomic Update) ] ---
// FIX 4: Tách logic ghim bài ra khỏi updatePost
// Endpoint: PUT /api/posts/admin/sticky/:id
export const togglePostStickyController = asyncHandler(
  async (
    req: AuthenticatedRequest<PostParams, {}, ToggleStickyBody>,
    res: Response
  ) => {
    const postId = req.params.id;
    const { is_sticky } = req.body; // Giá trị mới (true/false)

    if (!Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid Post ID format." });
    }
    if (typeof is_sticky !== "boolean") {
      return res.status(400).json({ error: "is_sticky must be a boolean." });
    }

    // SỬ DỤNG ATOMIC UPDATE: Chỉ cập nhật trường này
    const result = await Post.updateOne(
      { _id: postId },
      { $set: { is_sticky } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Post not found." });
    }

    // Lấy lại bài viết đã cập nhật bằng Aggregation cho phản hồi
    const updatedPostArray = await Post.aggregate([
      ...buildPostAggregationPipeline(
        { _id: new Types.ObjectId(postId) },
        {
          includeUser: true,
          includeTopic: true,
          includeTags: true,
          includeProjection: true,
        }
      ),
    ]).exec();

    res.json(updatedPostArray[0]);
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
    const { topicId, tags, title, content, status } = req.body;

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
      if (status === "approved" || status === "rejected") {
        shouldSetStatusToPending = false; // Admin đã quyết định status thủ công
      }
    }

    // 4.2. USER (AUTHOR) ACTIONS
    if (isAuthor && !isAdmin) {
      // User KHÔNG CÓ quyền thay đổi status hoặc is_sticky (is_sticky đã được loại bỏ)
      if (status) {
        // Chỉ cần check status
        return res.status(403).json({
          error: "Users cannot directly change post status.",
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

// --- [ ADMIN: Duyệt Bài Viết và Pending Tags (GIAI ĐOẠN 3) ] ---
// Endpoint: POST /api/posts/admin/approve/:id
export const adminApprovePostController = asyncHandler(
  async (
    req: AuthenticatedRequest<PostParams, {}, AdminApprovePostBody>,
    res: Response
  ) => {
    const postId = req.params.id;
    const adminId = req.userId;
    const { pendingTagActions, newPostStatus } = req.body;

    if (!Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid Post ID format." });
    }

    if (!pendingTagActions || !newPostStatus) {
      return res.status(400).json({
        error: "Missing pendingTagActions or newPostStatus in request body.",
      });
    }

    if (newPostStatus !== "approved" && newPostStatus !== "rejected") {
      return res
        .status(400)
        .json({ error: "newPostStatus must be 'approved' or 'rejected'." });
    }

    // GỌI DỊCH VỤ TRANSACTIONAL ĐỂ XỬ LÝ LOGIC PHỨC TẠP
    const updatedPost = await adminApprovePost(
      postId,
      adminId,
      pendingTagActions,
      newPostStatus
    );

    // FIX N+1: Sử dụng Aggregation cho phản hồi
    const finalPostArray = await Post.aggregate([
      ...buildPostAggregationPipeline(
        { _id: updatedPost._id },
        {
          includeUser: true,
          includeTopic: true,
          includeTags: true,
          includeProjection: true,
        }
      ),
    ]).exec();

    res.json(finalPostArray[0]);
  }
);
