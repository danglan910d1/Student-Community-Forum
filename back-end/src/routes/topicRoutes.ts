import { Router } from "express";
import {
  getTopicsList, // <-- Hàm mới thay thế cho cả hai
  createTopic,
  getTopicById,
  updateTopic,
} from "../controllers/topicController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { generalLimiter, sensitiveLimiter } from "../middleware/reatelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// --- [ PUBLIC ] ---
// GET /api/topics (Lấy tất cả topics đã được duyệt)
router.get("/", generalLimiter, getTopicsList); // Gọi hàm gộp chung

// --- [ ADMIN ONLY ] ---
// Tất cả các route admin đều cần authMiddleware và adminMiddleware
// POST /api/topics/admin (Tạo topic mới)
router.post(
  "/admin",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  createTopic
);

// GET /api/topics/admin (Lấy tất cả topics, bao gồm cả pending/rejected) <-- Dùng lại hàm gộp
router.get(
  "/admin",
  generalLimiter,
  authMiddleware,
  adminMiddleware,
  getTopicsList
);

// GET /api/topics/admin/:id (Lấy chi tiết Topic bằng ID)
router.get(
  "/admin/:id",
  authMiddleware,
  generalLimiter,
  adminMiddleware,
  getTopicById
);

// PUT /api/topics/admin/:id (Cập nhật topic, bao gồm cả duyệt status)
router.put(
  "/admin/:id",
  authMiddleware,
  sensitiveLimiter,
  adminMiddleware,
  preventDuplicateRequest,
  updateTopic
);

export default router;
