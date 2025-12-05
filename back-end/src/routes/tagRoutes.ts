import { Router } from "express";
import {
  getTagsList,
  updateTag,
  getTagById,
  deleteTag,
} from "../controllers/tagController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { generalLimiter, sensitiveLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// --- [ PUBLIC/USER ] ---
// GET /api/tags (Lấy tất cả tags đã được duyệt, có thể lọc theo topicId)
router.get("/", generalLimiter, getTagsList); // Gọi hàm gộp chung (Public)

// --- [ ADMIN ONLY ] ---
// GET /api/tags/admin (Lấy tất cả tags, bao gồm cả pending) <-- Dùng lại hàm gộp
router.get(
  "/admin",
  generalLimiter,
  authMiddleware,
  adminMiddleware,
  getTagsList
);

// GET /api/tags/admin/:id (Lấy chi tiết Tag bằng ID)
router.get(
  "/admin/:id",
  generalLimiter,
  authMiddleware,
  adminMiddleware,
  getTagById
);

// PUT /api/tags/admin/:id (Cập nhật tag, bao gồm cả duyệt status)
router.put(
  "/admin/:id",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  updateTag
);

// DELETE /api/tags/admin/:id (Xóa Tag)
router.delete(
  "/admin/:id",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  deleteTag
);

export default router;
