import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostByIdForAdmin,
  adminApprovePostController,
  restorePost,
  togglePostStickyController,
} from "../controllers/postController";
import { authMiddleware } from "../middleware/auth"; // auth.ts
import { adminMiddleware } from "../middleware/admin"; // Dùng để kiểm tra vai trò
import { optionalAuth } from "../middleware/optionalAuth";
import { generalLimiter, sensitiveLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// --- [ NHÓM 1: ADMIN ONLY ACCESS ] ---
// Các thao tác quản trị viên. Yêu cầu cả Đăng nhập + Quyền Admin.

// POST /api/posts/admin/approve/:id (Admin duyệt bài viết và quyết định các Tag mới do User đề xuất)
router.post(
  "/admin/approve/:id",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  adminApprovePostController
);

// PUT /api/posts/admin/restore/:id (Admin khôi phục bài viết đã bị xóa mềm từ thùng rác)
router.put(
  "/admin/restore/:id",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  restorePost
);

// PUT /api/posts/admin/sticky/:id (Admin ghim bài viết lên đầu trang hoặc bỏ ghim bài)
router.put(
  "/admin/sticky/:id",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  togglePostStickyController
);

// GET /api/posts/admin/:id (Admin lấy chi tiết bài viết bất kể trạng thái: pending, rejected, deleted)
router.get(
  "/admin/:id",
  generalLimiter,
  authMiddleware,
  adminMiddleware,
  getPostByIdForAdmin
);

// --- [ NHÓM 2: PUBLIC ACCESS ] ---
// Các route dành cho khách truy cập hoặc không bắt buộc đăng nhập chặt chẽ.

// GET /api/posts (Lấy danh sách bài: Khách thấy bài Approved, User thấy bài của mình, Admin thấy hết)
router.get("/", generalLimiter, optionalAuth, getPosts);

// GET /api/posts/:id (Khách xem bài đã duyệt + Tăng view qua Redis. Phải đặt sau các route /admin để tránh xung đột)
router.get("/:id", generalLimiter, getPostById);

// --- [ NHÓM 3: USER ACCESS ] ---
// Các route yêu cầu người dùng phải đăng nhập (Author) hoặc Admin.

// POST /api/posts (Người dùng tạo bài viết mới - Mặc định status sẽ là 'pending')
router.post(
  "/",
  sensitiveLimiter,
  authMiddleware,
  preventDuplicateRequest,
  createPost
);

// PUT /api/posts/:id (Tác giả sửa bài của mình hoặc Admin sửa bất kỳ bài nào)
router.put(
  "/:id",
  sensitiveLimiter,
  authMiddleware,
  preventDuplicateRequest,
  updatePost
);

// DELETE /api/posts/:id (Tác giả xóa bài mình hoặc Admin xóa bất kỳ - Thực hiện xóa mềm)
router.delete("/:id", sensitiveLimiter, authMiddleware, deletePost);

export default router;
