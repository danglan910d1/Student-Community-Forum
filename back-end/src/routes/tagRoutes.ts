// src/routes/tagRoutes.ts (Prefix: /api/tags)

import { Router, RequestHandler } from "express";
import {
  getApprovedTags,
  suggestTag,
  getAllTagsForAdmin,
  updateTag,
} from "../controllers/tagController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// --- [ PUBLIC/USER ] ---
// GET /api/tags (Lấy tất cả tags đã được duyệt, có thể lọc theo topicId)
router.get("/", getApprovedTags);

// POST /api/tags (User gợi ý tag mới)
router.post(
  "/",
  authMiddleware, // Cần xác thực để biết ai là người gợi ý (createdBy)
  suggestTag as unknown as RequestHandler
);

// --- [ ADMIN ONLY ] ---
// GET /api/tags/admin (Lấy tất cả tags, bao gồm cả pending)
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  getAllTagsForAdmin as unknown as RequestHandler
);

// PUT /api/tags/admin/:id (Cập nhật tag, bao gồm cả duyệt status)
router.put(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  updateTag as unknown as RequestHandler
);

export default router;
