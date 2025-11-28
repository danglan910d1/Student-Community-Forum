import { Router } from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  getAllCommentsForAdmin,
} from "../controllers/commentController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { generalRateLimiter } from "../config/rateLimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// Định nghĩa các Route cho Comments (Prefix: /api/comments)

// --- [ PUBLIC ] ---
// GET /api/comments?postId=...&parentId=...
// Lấy danh sách bình luận (cấp 1 HOẶC replies) cho một bài viết (không cần đăng nhập)
router.get("/", generalRateLimiter, getComments);

// --- [ USER/ADMIN ACCESS - Cần Đăng nhập ] ---
// POST /api/comments (Tạo bình luận mới hoặc trả lời/reply)
// Cần authMiddleware để lấy userId
router.post(
  "/",
  generalRateLimiter,
  authMiddleware,
  preventDuplicateRequest,
  createComment
);

// PUT /api/comments/:commentId (Cập nhật bình luận)
// Cần authMiddleware để lấy userId và adminMiddleware để gán userRole
router.put(
  "/:commentId",
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  updateComment
);

// DELETE /api/comments/:commentId (Xóa bình luận - Soft Delete)
// Cần authMiddleware để lấy userId và adminMiddleware để gán userRole
router.delete(
  "/:commentId",
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  deleteComment
);

// --- [ ADMIN ONLY ACCESS ] ---
// GET /api/comments/admin (Lấy tất cả comments, kể cả pending và đã xóa)
router.get(
  "/admin",
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  getAllCommentsForAdmin // <-- Route Admin đã được thêm
);

export default router;
