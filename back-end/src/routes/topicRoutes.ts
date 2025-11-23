import { Router, RequestHandler } from "express";
import {
  getTopicsList, // <-- Hàm mới thay thế cho cả hai
  createTopic,
  getTopicById,
  updateTopic,
} from "../controllers/topicController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// --- [ PUBLIC ] ---
// GET /api/topics (Lấy tất cả topics đã được duyệt)
router.get("/", getTopicsList as RequestHandler); // Gọi hàm gộp chung

// --- [ ADMIN ONLY ] ---
// Tất cả các route admin đều cần authMiddleware và adminMiddleware
// POST /api/topics/admin (Tạo topic mới)
router.post(
  "/admin",
  authMiddleware,
  adminMiddleware,
  createTopic as unknown as RequestHandler
);

// GET /api/topics/admin (Lấy tất cả topics, bao gồm cả pending/rejected) <-- Dùng lại hàm gộp
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  getTopicsList as unknown as RequestHandler
);

// GET /api/topics/admin/:id (Lấy chi tiết Topic bằng ID)
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  getTopicById as unknown as RequestHandler
);

// PUT /api/topics/admin/:id (Cập nhật topic, bao gồm cả duyệt status)
router.put(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  updateTopic as unknown as RequestHandler
);

export default router;
