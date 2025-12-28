import { Router } from "express";
import {
  getTagsList,
  updateTag,
  getTagById,
  deleteTag,
  createTagByAdmin,
  bulkUpdateTags,
  restoreTag,
} from "../controllers/tagController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { generalLimiter, sensitiveLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// --- [ NHÓM 1: ADMIN ONLY ACCESS ] ---
// Các thao tác quản lý kho dữ liệu Tag. Yêu cầu cả Đăng nhập + Quyền Admin.

// GET /api/tags/admin (Admin lấy toàn bộ danh sách Tags, bao gồm cả pending/rejected/deleted)
router.get(
  "/admin",
  generalLimiter,
  authMiddleware,
  adminMiddleware,
  getTagsList
);

// POST /api/tags/admin (Admin tạo Tag chính thống trực tiếp từ Dashboard)
router.post(
  "/admin",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  createTagByAdmin
);

// PATCH /api/tags/admin/bulk (Duyệt hoặc từ chối trạng thái nhiều Tag cùng lúc - Tiết kiệm thời gian cho Admin)
router.patch(
  "/admin/bulk",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  bulkUpdateTags
);

// PUT /api/tags/admin/restore/:id (Admin khôi phục Tag từ trạng thái đã xóa về lại trạng thái hoạt động)
// Đặt trước route :id để tránh xung đột
router.put(
  "/admin/restore/:id",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  restoreTag
);

// GET /api/tags/admin/:id (Admin lấy chi tiết 1 Tag kèm thông tin người tạo và Topic liên kết)
router.get(
  "/admin/:id",
  generalLimiter,
  authMiddleware,
  adminMiddleware,
  getTagById
);

// PUT /api/tags/admin/:id (Admin cập nhật Tag lẻ: Sửa lỗi chính tả tên Tag hoặc gán lại TopicId cho Tag)
router.put(
  "/admin/:id",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  updateTag
);

// DELETE /api/tags/admin/:id (Admin xóa mềm Tag - Chuyển is_deleted thành true thay vì xóa vĩnh viễn)
router.delete(
  "/admin/:id",
  sensitiveLimiter,
  authMiddleware,
  adminMiddleware,
  deleteTag
);

// --- [ NHÓM 2: PUBLIC / USER ACCESS ] ---
// Dành cho khách xem bài viết hoặc User chọn Tag khi đăng bài.

// GET /api/tags (Public: Lấy danh sách Tag đã được duyệt 'approved' để hiển thị ngoài trang chủ hoặc gợi ý gõ bài)
router.get("/", generalLimiter, getTagsList);

export default router;
