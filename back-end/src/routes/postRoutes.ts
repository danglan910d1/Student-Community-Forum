import { Router, RequestHandler } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostByIdForAdmin,
} from "../controllers/postController";
import { authMiddleware } from "../middleware/auth"; // auth.ts
import { adminMiddleware } from "../middleware/admin"; // Dùng để kiểm tra vai trò

const router = Router();

// --- [ PUBLIC / USER ACCESS ] ---
// GET /api/posts (Lấy danh sách, phân trang, lọc theo topic/tag, và giờ là status)
// User thường mặc định chỉ xem được "approved"
router.get(
  "/", // KHÔNG CẦN authMiddleware bắt buộc (Optional Auth)
  getPosts as unknown as RequestHandler
);

// GET /api/posts/:id (Lấy chi tiết và tăng view)
router.get("/:id", getPostById);

// POST /api/posts (User tạo bài viết mới)
router.post("/", authMiddleware, createPost as unknown as RequestHandler);

// PUT /api/posts/:id (User sửa bài của mình, Admin sửa bất kỳ)
router.put(
  "/:id",
  authMiddleware, // Cần xác thực để kiểm tra quyền hạn (isAuthor/isAdmin)
  updatePost as unknown as RequestHandler
);

// DELETE /api/posts/:id (User xóa bài của mình, Admin xóa bất kỳ)
router.delete("/:id", authMiddleware, deletePost as unknown as RequestHandler);

// --- [ ADMIN ONLY ACCESS ] ---
// GET /api/posts/admin/:id (Lấy chi tiết Bài viết bất kể status)
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  getPostByIdForAdmin as unknown as RequestHandler
);

export default router;
