/**
 * CONTROLLER: postController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến Bài viết (CRUD, Kiểm duyệt, Tương tác).
 * * Nguyên tắc áp dụng: HOF, Type Safety, RBAC Logic, Data Integrity.
 */
import { Request, Response } from "express";
import Post, { IPost } from "../models/Post";
import Topic from "../models/Topic";
import { AuthenticatedRequest } from "../types/express";
import { Types } from "mongoose";
import {
  PostParams,
  CreatePostBody,
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

    // 5. Tạo bài viết trong DB
    const newPostRaw = await Post.create({
      userId: new Types.ObjectId(userId),
      topicId: topic._id,
      tags: validTagIds,
      pending_tags: pendingTagIds,
      title,
      slug,
      content,
      status: "pending",
      is_sticky: false,
      is_deleted: false, // Khởi tạo giá trị soft delete
    });

    // 2. TRẢ VỀ QUA PIPELINE: Để FE nhận được postId và Author object ngay lập tức
    const postArray = await Post.aggregate(
      buildPostAggregationPipeline(
        { _id: newPostRaw._id },
        { includeUser: true, includeTopic: true, includeTags: true },
        req.userRole === "admin",
        userId
      )
    );

    res.status(201).json(postArray[0]);
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

    if (!Types.ObjectId.isValid(postId))
      return res.status(400).json({ error: "Invalid ID." });

    const post = await Post.findOne({ _id: postId, is_deleted: { $ne: true } });
    if (!post)
      return res.status(404).json({ error: "Post not found or deleted." });

    const isAuthor = post.userId.toString() === userId;
    const isAdmin = req.userRole === "admin";
    if (!isAuthor && !isAdmin)
      return res.status(403).json({ error: "Access denied." });

    const updateFields: Partial<IPost> = {};
    let currentTopicId = post.topicId;

    // 1. Cập nhật nội dung (Không đổi status bài viết)
    if (title && title.trim() !== post.title) {
      updateFields.title = title.trim();
      updateFields.slug = generateSlug(title.trim());
    }
    if (content && content.trim() !== post.content) {
      updateFields.content = content.trim();
    }

    // 2. Cập nhật Topic
    if (topicId && !post.topicId.equals(topicId)) {
      const topic = await Topic.findOne({ _id: topicId, status: "approved" });
      if (topic) {
        updateFields.topicId = topic._id as Types.ObjectId;
        currentTopicId = topic._id as Types.ObjectId;
      }
    }

    // 3. Cập nhật Tags (Logic mới: Không bắt duyệt lại bài)
    if (tags) {
      const { validTagIds, pendingTagIds } = await processTags(
        tags,
        userId,
        currentTopicId
      );
      updateFields.tags = validTagIds;
      updateFields.pending_tags = pendingTagIds;

      if (pendingTagIds.length > 0) {
        console.log(`Log: Bài ${postId} có tag mới chờ Admin duyệt.`);
      }
    }

    // 4. Quyền Admin cập nhật Status trực tiếp
    if (isAdmin && status) updateFields.status = status;

    const updatedPostRaw = await Post.findByIdAndUpdate(
      postId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    const postArray = await Post.aggregate(
      buildPostAggregationPipeline(
        { _id: updatedPostRaw!._id },
        { includeUser: true, includeTopic: true, includeTags: true },
        isAdmin,
        userId
      )
    );

    res.json(postArray[0]);
  }
);
// --- [ PUBLIC/ADMIN: Lấy danh sách Bài Viết ] ---
// Hỗ trợ phân trang, lọc theo Topic, Tag và STATUS
// Endpoint: GET /api/posts
export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as any;
  const { page, limit } = query;

  // 1. Xác định context người dùng
  const isAdmin = (req as any).userRole === "admin";
  const userId = (req as any).userId;

  // 2. Xử lý Cache Key
  const sortedQuery = Object.keys(query)
    .sort()
    .map((k) => `${k}=${query[k]}`)
    .join(":");
  const cacheKey = `posts:list:${isAdmin ? "admin" : "public"}:${sortedQuery}`;

  const cachedData = await getCache(cacheKey);
  if (cachedData) return res.json(cachedData);

  // 3. Xây dựng Filter & Pipeline
  const filter = buildPostFilter(query, { userId, isAdmin });
  console.log(isAdmin);
  const pipeline = buildPostAggregationPipeline(
    filter,
    { includeUser: true, includeTopic: true, includeTags: true },
    isAdmin,
    userId
  );

  // Sắp xếp: Ưu tiên bài ghim, sau đó đến bài mới nhất
  pipeline.push({ $sort: { is_sticky: -1, createdAt: -1 } });

  // 4. Phân trang & Trả kết quả
  const result = await paginateAggregation(Post, pipeline, page, limit);

  const response = {
    posts: result.items,
    pagination: {
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      limit: result.limit,
    },
  };

  // 5. Lưu Cache
  await setCache(cacheKey, response, isAdmin ? 60 : 300);

  res.json(response);
});

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

// --- [ USER/ADMIN: Xóa Bài Viết ] ---
// Cần authMiddleware (User chỉ xóa bài của mình, Admin xóa bài bất kỳ)
// Endpoint: DELETE /api/posts/:id
// --- [ USER/ADMIN: Xóa Bài Viết (SOFT DELETE) ] ---
export const deletePost = asyncHandler(
  async (req: AuthenticatedRequest<PostParams>, res: Response) => {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post || post.is_deleted)
      return res.status(404).json({ error: "Post not found." });

    const isAuthor = post.userId.toString() === userId;
    const isAdmin = req.userRole === "admin";
    if (!isAuthor && !isAdmin)
      return res.status(403).json({ error: "Access denied." });

    // Chuyển sang xóa mềm
    await Post.findByIdAndUpdate(postId, { is_deleted: true });

    // Không xóa Comment/Like ngay để có thể Restore.
    // Chúng sẽ bị ẩn tự động vì Filter của chúng ta đã chặn is_deleted của Post cha.

    res.json({ message: "Post moved to trash." });
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

export const restorePost = asyncHandler(
  async (req: AuthenticatedRequest<PostParams>, res: Response) => {
    const { id } = req.params;
    const result = await Post.findByIdAndUpdate(
      id,
      { is_deleted: false },
      { new: true }
    );

    if (!result) return res.status(404).json({ error: "Post not found." });
    res.json({ message: "Post restored successfully.", postId: id });
  }
);
