import { Router } from "express";
import {
  getTopicsList,
  createTopic,
  getTopicById,
  updateTopic,
  deleteTopic,
  restoreTopic,
} from "../controllers/topicController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { generalLimiter, sensitiveLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// --- [ NHÓM 1: ADMIN ONLY ACCESS ] ---
// Các thao tác quản trị dành cho Topic. Yêu cầu Đăng nhập + Quyền Admin.

// GET /api/topics/admin (Admin lấy toàn bộ danh sách, kể cả pending/rejected/deleted)
router.get(
  "/admin",
  generalLimiter,
  authMiddleware,
  adminMiddleware,
  getTopicsList
);

// POST /api/topics/admin (Admin tạo topic mới trực tiếp)
router.post(
  "/admin",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  createTopic
);

// PUT /api/topics/admin/restore/:id (Admin khôi phục Topic từ thùng rác)
// Lưu ý: Đặt trước route :id để Express không nhầm "restore" là một ID bài viết
router.put(
  "/admin/restore/:id",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  restoreTopic
);

// GET /api/topics/admin/:id (Admin lấy chi tiết 1 topic kèm thông tin Creator)
router.get(
  "/admin/:id",
  generalLimiter,
  authMiddleware,
  adminMiddleware,
  getTopicById
);

// PUT /api/topics/admin/:id (Admin cập nhật topic hoặc duyệt status)
router.put(
  "/admin/:id",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  updateTopic
);

// DELETE /api/topics/admin/:id (Admin xóa mềm Topic)
router.delete(
  "/admin/:id",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  deleteTopic
);

// --- [ NHÓM 2: PUBLIC ACCESS ] ---
// Các route dành cho người dùng vãng lai hoặc User chọn topic khi đăng bài.

// GET /api/topics (Public: Lấy danh sách các topic đã approved để user chọn khi đăng bài)
router.get("/", generalLimiter, getTopicsList);

export default router;
