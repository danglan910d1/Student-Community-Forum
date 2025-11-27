import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostByIdForAdmin,
  adminApprovePostController,
} from "../controllers/postController";
import { authMiddleware } from "../middleware/auth"; // auth.ts
import { adminMiddleware } from "../middleware/admin"; // Dùng để kiểm tra vai trò
import { generalRateLimiter } from "../config/rateLimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// --- [ ADMIN ONLY ACCESS ] ---
// LƯU Ý: Đặt route có tiền tố Admin lên trước route Public/User để tránh xung đột
// Vì Express sẽ hiểu '/admin' là tham số ':id'
router.get(
  "/admin/:id", // GET /api/posts/admin/:id (Lấy chi tiết Bài viết bất kể status)
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  getPostByIdForAdmin
);
// POST /api/posts/admin/approve/:id (DUYỆT BÀI VÀ PENDING TAGS - GIAI ĐOẠN 3)
router.post(
  "/admin/approve/:id",
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  adminApprovePostController
);

// --- [ PUBLIC / USER ACCESS ] ---
// GET /api/posts (Lấy danh sách, phân trang, lọc theo topic/tag, và giờ là status)
router.get(
  "/", // KHÔNG CẦN authMiddleware bắt buộc (Optional Auth)
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  getPosts
);

// GET /api/posts/:id (Lấy chi tiết và tăng view)
router.get("/:id", generalRateLimiter, getPostById);

// POST /api/posts (User tạo bài viết mới)
router.post(
  "/",
  generalRateLimiter,
  authMiddleware,
  preventDuplicateRequest,
  createPost
);

// PUT /api/posts/:id (User sửa bài của mình, Admin sửa bất kỳ)
router.put(
  "/:id",
  generalRateLimiter,
  authMiddleware, // Cần xác thực để kiểm tra quyền hạn (isAuthor/isAdmin)
  preventDuplicateRequest,
  updatePost
);

// DELETE /api/posts/:id (User xóa bài của mình, Admin xóa bất kỳ)
router.delete("/:id", generalRateLimiter, authMiddleware, deletePost);

export default router;
