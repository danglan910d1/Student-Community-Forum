import { Request, Response } from "express";
import Post from "../models/Post";
import Topic from "../models/Topic";
import Tag from "../models/Tag";
import Comment from "../models/Comment";
import Like from "../models/Like";
import { AuthenticatedRequest } from "../types/express";
import { Types } from "mongoose";

// Định nghĩa kiểu dữ liệu cho Params
interface PostParams {
  id: string;
}

interface CreatePostBody {
  topicId: string;
  tags?: string[]; // Mảng ID Tags
  title: string;
  content: string;
}

// Định nghĩa kiểu cho Request có thể có userRole sau khi qua middleware
interface GetPostsQuery {
  topicId?: string;
  tagId?: string;
  page?: string;
  limit?: string;
  status?: "pending" | "approved" | "rejected";
}

interface UpdatePostBody {
  topicId?: string;
  tags?: string[];
  title?: string;
  content?: string;
  status?: "pending" | "approved" | "rejected"; // Dành cho Admin
  is_sticky?: boolean; // Dành cho Admin
}

// --- [ USER: Tạo Bài Viết Mới ] ---
// Cần authMiddleware
export const createPost = async (
  req: AuthenticatedRequest<{}, {}, CreatePostBody>,
  res: Response
) => {
  try {
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

      validTagIds = approvedTags.map((tag) => tag._id);
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during post creation." });
  }
};

// --- [ PUBLIC/ADMIN: Lấy danh sách Bài Viết ] ---
// Hỗ trợ phân trang, lọc theo Topic, Tag và STATUS
export const getPosts = async (
  req: AuthenticatedRequest<{}, {}, {}, GetPostsQuery>,
  res: Response
) => {
  try {
    // 1. Lấy tham số query
    const { topicId, tagId, page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const isAdmin = req.userRole === "admin";

    const skip = (pageNum - 1) * limitNum;

    // 2. Thiết lập bộ lọc STATUS (Quan trọng!)
    const filter: any = {};

    if (status && isAdmin) {
      // Admin có thể lọc theo status bất kỳ
      const validStatuses = ["pending", "approved", "rejected"];
      if (validStatuses.includes(status)) {
        filter.status = status;
      } else {
        return res.status(400).json({ error: "Invalid status value." });
      }
    } else {
      // User thường (hoặc request không truyền status) MẶC ĐỊNH chỉ thấy "approved"
      filter.status = "approved";
    }

    // 3. Thêm lọc theo Topic
    if (
      topicId &&
      typeof topicId === "string" &&
      Types.ObjectId.isValid(topicId)
    ) {
      filter.topicId = new Types.ObjectId(topicId);
    }

    // 4. Thêm lọc theo Tag
    if (tagId && typeof tagId === "string" && Types.ObjectId.isValid(tagId)) {
      filter.tags = new Types.ObjectId(tagId); // Mongoose tìm kiếm trong mảng tags
    }

    // 5. Tính tổng số lượng bài viết (cho phân trang)
    const totalPosts = await Post.countDocuments(filter);

    // 6. Thực hiện truy vấn chính
    const posts = await Post.find(filter)
      .sort({ is_sticky: -1, createdAt: -1 }) // Ưu tiên bài ghim, sau đó là bài mới nhất
      .skip(skip)
      .limit(limitNum)
      .populate("userId", "name avatar") // Hiển thị thông tin người dùng
      .populate("topicId", "name slug") // Hiển thị Topic
      .populate("tags", "name"); // Hiển thị Tags

    // 7. Phản hồi kèm thông tin phân trang
    res.json({
      posts,
      currentPage: pageNum,
      totalPages: Math.ceil(totalPosts / limitNum),
      totalItems: totalPosts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during fetching posts." });
  }
};

// --- [ PUBLIC: Lấy chi tiết Bài Viết và tăng Views ] ---
export const getPostById = async (req: Request<PostParams>, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Tìm Bài viết, chỉ lấy bài APPROVED
    // 2. Tăng views_count (sử dụng findByIdAndUpdate atomic update)
    const post = await Post.findOneAndUpdate(
      { _id: id, status: "approved" },
      { $inc: { views_count: 1 } }, // Tăng views_count lên 1
      { new: true } // Trả về tài liệu sau khi cập nhật
    )
      .populate("userId", "name avatar")
      .populate("topicId", "name slug")
      .populate("tags", "name");

    if (!post) {
      return res.status(404).json({ error: "Post not found or not approved." });
    }

    // 3. Phản hồi thành công
    res.json(post);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Server error during fetching post details." });
  }
};

// --- [ ADMIN: Lấy chi tiết Bài Viết Bất kể Status ] ---
// Cần authMiddleware & adminMiddleware
export const getPostByIdForAdmin = async (
  req: AuthenticatedRequest<PostParams>,
  res: Response
) => {
  try {
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
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Server error during fetching post details for admin." });
  }
};

// --- [ USER/ADMIN: Cập nhật Bài Viết ] ---
// Cần authMiddleware (User chỉ sửa bài của mình, Admin sửa bài bất kỳ)
export const updatePost = async (
  req: AuthenticatedRequest<PostParams, {}, UpdatePostBody>,
  res: Response
) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const { topicId, tags, title, content, status, is_sticky } = req.body;

    // 1. Tìm bài viết hiện có
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // 2. KIỂM TRA QUYỀN HẠN
    const isAuthor = post.userId.toString() === userId;
    const isAdmin = req.userRole === "admin"; // Giả định req.userRole được gán trong adminMiddleware hoặc authMiddleware

    // Nếu không phải tác giả VÀ không phải admin -> Từ chối
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Access denied. Only author or admin can update this post.",
      });
    }

    const updateFields: any = {};

    // 3. Cập nhật các trường cho TÁC GIẢ
    if (isAuthor) {
      if (title) updateFields.title = title;
      if (content) updateFields.content = content;

      // Nếu tác giả sửa bài, status luôn trở về pending để Admin duyệt lại
      if (title || content || tags || topicId) {
        updateFields.status = "pending";
      }

      // Xử lý Topic (Cần xác minh Topic tồn tại và approved)
      if (topicId) {
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
        updateFields.tags = approvedTags.map((tag) => tag._id);
      }
    }

    // 4. Cập nhật các trường cho ADMIN (Chỉ Admin mới được thay đổi status và is_sticky)
    if (isAdmin) {
      if (status) updateFields.status = status;
      if (is_sticky !== undefined) updateFields.is_sticky = is_sticky;

      // Admin có thể thay đổi các trường còn lại nếu cần (nếu không được tác giả thay đổi)
      if (title && !isAuthor) updateFields.title = title;
      // ... (Thêm logic Admin cập nhật các trường khác nếu cần)
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during post update." });
  }
};

// --- [ USER/ADMIN: Xóa Bài Viết ] ---
// Cần authMiddleware (User chỉ xóa bài của mình, Admin xóa bài bất kỳ)
export const deletePost = async (
  req: AuthenticatedRequest<PostParams>,
  res: Response
) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    // 1. Tìm bài viết hiện có
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    // 2. KIỂM TRA QUYỀN HẠN
    const isAuthor = post.userId.toString() === userId;
    const isAdmin = req.userRole === "admin"; // Giả định req.userRole có sẵn

    // Nếu không phải tác giả VÀ không phải admin -> Từ chối
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Access denied. Only author or admin can delete this post.",
      });
    }

    // 3. Thực hiện xóa
    await post.deleteOne();

    // 4. XÓA DỮ LIỆU LIÊN QUAN (QUAN TRỌNG)
    // Xóa tất cả Comments thuộc về bài viết này
    // Cần đảm bảo Comment Model và Like Model đã được import
    if (typeof Comment !== "undefined") {
      await Comment.deleteMany({ postId: postId });
    }

    // Xóa tất cả Likes nhắm vào bài viết này
    if (typeof Like !== "undefined") {
      await Like.deleteMany({ targetId: postId, targetType: "post" });
    }

    res.json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during post deletion." });
  }
};
