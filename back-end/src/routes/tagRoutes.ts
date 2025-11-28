import { Router } from "express";
import {
  getTagsList,
  updateTag,
  getTagById,
  deleteTag,
} from "../controllers/tagController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { generalRateLimiter } from "../config/rateLimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// --- [ PUBLIC/USER ] ---
// GET /api/tags (Lấy tất cả tags đã được duyệt, có thể lọc theo topicId)
router.get("/", generalRateLimiter, getTagsList); // Gọi hàm gộp chung (Public)

// --- [ ADMIN ONLY ] ---
// GET /api/tags/admin (Lấy tất cả tags, bao gồm cả pending) <-- Dùng lại hàm gộp
router.get(
  "/admin",
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  getTagsList
);

// GET /api/tags/admin/:id (Lấy chi tiết Tag bằng ID)
router.get(
  "/admin/:id",
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  getTagById
);

// PUT /api/tags/admin/:id (Cập nhật tag, bao gồm cả duyệt status)
router.put(
  "/admin/:id",
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  updateTag
);

// DELETE /api/tags/admin/:id (Xóa Tag)
router.delete(
  "/admin/:id",
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  deleteTag
);

export default router;
