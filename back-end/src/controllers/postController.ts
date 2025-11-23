/**
 * CONTROLLER: postController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến Bài viết (CRUD, Kiểm duyệt, Tương tác).
 * * Nguyên tắc áp dụng: HOF, Type Safety, RBAC Logic, Data Integrity.
 */
import { Request, Response } from "express";
import Post, { IPost } from "../models/Post";
import Topic from "../models/Topic";
import Tag from "../models/Tag";
import Comment from "../models/Comment";
import Like from "../models/Like";
import { AuthenticatedRequest } from "../types/express";
import { Types } from "mongoose";
import {
  PostParams,
  CreatePostBody,
  GetPostsQuery,
  UpdatePostBody,
  PostStatus,
} from "../types/post";
import { asyncHandler } from "../utils/asyncHandler";
import { paginate } from "../utils/pagination";

// --- [ USER: Tạo Bài Viết Mới ] ---
// Cần authMiddleware
// Endpoint: POST /api/posts
export const createPost = asyncHandler(
  async (req: AuthenticatedRequest<{}, {}, CreatePostBody>, res: Response) => {
    // 1. Lấy dữ liệu
    const { topicId, tags, title, content } = req.body;
    const userId = req.userId;

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

    // 4. Xác minh và lọc Tags (chỉ chấp nhận tags đã Approved)
    let validTagIds: Types.ObjectId[] = [];
    if (tags && tags.length > 0) {
      // Lọc bỏ các ID không hợp lệ về mặt định dạng
      const cleanTagIds = tags.filter((id) => Types.ObjectId.isValid(id));

      // Tìm các Tag tồn tại VÀ có status là "approved"
      const approvedTags = await Tag.find({
        _id: { $in: cleanTagIds },
        status: "approved",
      }).select("_id");

      validTagIds = approvedTags.map((tag) => tag._id as Types.ObjectId);
    }

    // 5. Tạo bài viết
    const newPost = await Post.create({
      userId: new Types.ObjectId(userId),
      topicId: topic._id,
      tags: validTagIds,
      title,
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
    // 1. Lấy tham số query
    const { topicId, tagId, page, limit, status, search } = req.query;

    // Sử dụng userRole để xác định quyền hạn (Zero-Lookup)
    const isAdmin = "userRole" in req ? req.userRole === "admin" : false;

    // 2. Thiết lập bộ lọc STATUS (Quan trọng!)
    const filter: any = {};

    if (status && isAdmin) {
      // Admin có thể lọc theo status bất kỳ
      const validStatuses: PostStatus[] = ["pending", "approved", "rejected"];
      if (validStatuses.includes(status)) {
        filter.status = status;
      } else {
        return res.status(400).json({ error: "Invalid status value." });
      }
    } else {
      // User thường (hoặc request không truyền status) MẶC ĐỊNH chỉ thấy "approved"
      filter.status = "approved";
    }

    // 3. Thêm lọc theo Topic và Tag (Kiểm tra ID)
    if (topicId && Types.ObjectId.isValid(topicId)) {
      filter.topicId = new Types.ObjectId(topicId);
    }
    if (tagId && Types.ObjectId.isValid(tagId)) {
      filter.tags = new Types.ObjectId(tagId); // Mongoose tìm kiếm trong mảng tags
    }

    // 4. Thêm tìm kiếm theo tiêu đề/nội dung
    if (search) {
      const regex = new RegExp(search as string, "i");
      filter.$or = [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
      ];
    }

    // 5. GỌI HÀM TIỆN ÍCH PHÂN TRANG (Loại bỏ logic tính toán lặp lại)
    const result = await paginate(
      Post,
      filter,
      { is_sticky: -1, createdAt: -1 }, // Ưu tiên bài ghim, sau đó là bài mới nhất
      page, // Truyền trực tiếp query param
      limit, // Truyền trực tiếp query param
      null, // Không loại trừ trường nào mặc định
      [
        // Populate fields
        { path: "userId", select: "name avatar" },
        { path: "topicId", select: "name slug" },
        { path: "tags", select: "name" },
      ]
    );

    // 6. Phản hồi kèm thông tin phân trang
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
        error: "Access denied. Only author or admin can update this post.",
      });
    }

    const updateFields: Partial<IPost> = {}; // Sử dụng Partial<IPost> để Type Safety

    // 3. Cập nhật các trường cho TÁC GIẢ (Chỉ được sửa nội dung/topic/tags)
    if (isAuthor) {
      if (title) updateFields.title = title.trim();
      if (content) updateFields.content = content.trim();

      // Nếu tác giả sửa bài, status luôn trở về pending để Admin duyệt lại
      if (title || content || tags || topicId) {
        updateFields.status = "pending";
      }

      // Xử lý Topic (Cần xác minh Topic tồn tại và approved)
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
        updateFields.topicId = topic._id;
      }

      // Xử lý Tags (Chỉ chấp nhận tags đã Approved)
      if (tags) {
        const cleanTagIds = tags.filter((id) => Types.ObjectId.isValid(id));
        const approvedTags = await Tag.find({
          _id: { $in: cleanTagIds },
          status: "approved",
        }).select("_id");
        updateFields.tags = approvedTags.map(
          (tag) => tag._id as Types.ObjectId
        );
      }
    }

    // 4. Cập nhật các trường cho ADMIN (Chỉ Admin mới được thay đổi status, is_sticky, hoặc sửa chữa nội dung)
    if (isAdmin) {
      if (status) updateFields.status = status;
      if (is_sticky !== undefined) updateFields.is_sticky = is_sticky;

      // Admin có thể sửa title/content/topicId/tags của người khác
      if (!isAuthor) {
        if (title) updateFields.title = title.trim();
        if (content) updateFields.content = content.trim();
        if (topicId && Types.ObjectId.isValid(topicId))
          updateFields.topicId = new Types.ObjectId(topicId);
        // Tags logic phức tạp hơn, có thể xử lý trong service nếu cần
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update." });
    }

    // 5. Thực hiện cập nhật
    const updatedPost = await Post.findByIdAndUpdate(postId, updateFields, {
      new: true,
      runValidators: true,
    })
      .populate("userId", "name avatar")
      .populate("topicId", "name slug")
      .populate("tags", "name");

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
