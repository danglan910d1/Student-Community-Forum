import { Router, RequestHandler } from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// Định nghĩa các Route cho Comments (Prefix: /api/comments)

// --- [ PUBLIC ] ---

// GET /api/comments?postId=...&parentId=...
// Lấy danh sách bình luận (cấp 1 HOẶC replies) cho một bài viết (không cần đăng nhập)
router.get("/", getComments as unknown as RequestHandler);

// --- [ USER/ADMIN ACCESS - Cần Đăng nhập ] ---

// POST /api/comments (Tạo bình luận mới hoặc trả lời/reply)
// Cần authMiddleware để lấy userId
router.post("/", authMiddleware, createComment as unknown as RequestHandler);

// PUT /api/comments/:commentId (Cập nhật bình luận)
// Cần authMiddleware để lấy userId và adminMiddleware để gán userRole
router.put(
  "/:commentId",
  authMiddleware,
  adminMiddleware,
  updateComment as unknown as RequestHandler
);

// DELETE /api/comments/:commentId (Xóa bình luận - Soft Delete)
// Cần authMiddleware để lấy userId và adminMiddleware để gán userRole
router.delete(
  "/:commentId",
  authMiddleware,
  adminMiddleware,
  deleteComment as unknown as RequestHandler
);

export default router;
