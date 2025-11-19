// src/routes/topicRoutes.ts (Prefix: /api/topics)

import { Router, RequestHandler } from "express";
import {
  getApprovedTopics,
  createTopic,
  getAllTopicsForAdmin,
  updateTopic,
  getTopicById,
} from "../controllers/topicController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// --- [ PUBLIC ] ---
// GET /api/topics (Lấy tất cả topics đã được duyệt)
router.get("/", getApprovedTopics);

// --- [ ADMIN ONLY ] ---
// Tất cả các route admin đều cần authMiddleware và adminMiddleware
// POST /api/topics/admin (Tạo topic mới)
router.post(
  "/admin",
  authMiddleware,
  adminMiddleware,
  createTopic as unknown as RequestHandler
);

// GET /api/topics/admin (Lấy tất cả topics, bao gồm cả pending/rejected)
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  getAllTopicsForAdmin as unknown as RequestHandler
);

// GET /api/topics/admin/:id (Lấy chi tiết Topic bằng ID bất kể chi tiết)
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

// Để xoá topics thì dùng PUT /api/topics/admin/:id, sửa status thành rejected

export default router;
