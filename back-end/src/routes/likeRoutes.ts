import { Router } from "express";
import { toggleLike, getLikeStatus } from "../controllers/likeController";
import { authMiddleware } from "../middleware/auth";
import { optionalAuth } from "../middleware/optionalAuth";
import { generalLimiter, sensitiveLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// Định nghĩa các Route cho Likes (Prefix: /api/likes)

// --- [ USER ACCESS - Cần Đăng nhập ] ---

// POST /api/likes/:targetType/:targetId
// Thao tác Thích/Bỏ Thích (Toggle) cho Post, Comment.
// Cần authMiddleware để lấy userId
router.post(
  "/:targetType/:targetId",
  sensitiveLimiter,
  authMiddleware,
  preventDuplicateRequest,
  toggleLike
);

// GET /api/likes?targetType=...&targetId=...
// Lấy trạng thái Like của người dùng hiện tại (Optional Auth) và tổng số Like
router.get("/", optionalAuth, generalLimiter, getLikeStatus);

export default router;
