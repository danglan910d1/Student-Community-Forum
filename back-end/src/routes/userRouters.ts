// src/routes/userRoutes.ts (Prefix: /api/users)

import { Router } from "express";
import {
  getMe,
  updateProfile,
  updatePassword,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUsersList,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";
import { generalLimiter, sensitiveLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";
import { multerErrorHandler, uploadSingleAvatar } from "../middleware/multer";

const router = Router();

/**
 * NHÓM 1: CÁC ROUTE ĐỊNH DANH CỤ THỂ (SPECIFIC ROUTES)
 * Đặt lên đầu để không bị các route động như /:id chiếm quyền.
 */

// --- [ ADMIN: Lấy danh sách tất cả Users (kể cả bị ban/xóa) ] ---
// GET /api/users/admin
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  generalLimiter,
  getUsersList
);

// --- [ USER: Lấy thông tin cá nhân của người dùng hiện tại ] ---
// GET /api/users/me
router.get("/me", authMiddleware, generalLimiter, getMe);

// --- [ USER: Cập nhật thông tin profile (Tên, Avatar) ] ---
// PUT /api/users/profile
router.put(
  "/profile",
  authMiddleware,
  sensitiveLimiter,
  multerErrorHandler(uploadSingleAvatar),
  preventDuplicateRequest,
  updateProfile
);

// --- [ USER: Cập nhật mật khẩu mới ] ---
// PUT /api/users/password
router.put(
  "/password",
  authMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  updatePassword
);

// --- [ USER: Người dùng tự xóa tài khoản của chính mình ] ---
// DELETE /api/users/me
router.delete(
  "/me",
  authMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  deleteUser
);

/**
 * NHÓM 2: CÁC ROUTE CÓ THAM SỐ BIẾN ĐỘNG (:id)
 */

// --- [ ADMIN: Cập nhật Trạng thái User (Ban/Unban hoặc đổi Role) ] ---
// PUT /api/users/admin/:id/status
router.put(
  "/admin/:id/status",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  updateUserStatus
);

// --- [ ADMIN: Xóa tài khoản người khác ] ---
// DELETE /api/users/admin/:id
router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  sensitiveLimiter,
  preventDuplicateRequest,
  deleteUser
);

// --- [ ADMIN: Xem chi tiết User theo ID (Admin View) ] ---
// GET /api/users/admin/:id
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  generalLimiter,
  getUserById
);

/**
 * NHÓM 3: CÁC ROUTE PUBLIC (CHUNG NHẤT)
 * Đặt ở cuối cùng để làm "lưới lọc" cuối.
 */

// --- [ PUBLIC: Tìm kiếm danh sách user công khai ] ---
// GET /api/users/
router.get("/", generalLimiter, getUsersList);

// --- [ PUBLIC: Xem hồ sơ công khai của người khác ] ---
// GET /api/users/:id
// Phải đặt sau các route /admin, /me, /profile,... nếu không nó sẽ coi các chữ đó là "id"
router.get("/:id", generalLimiter, getUserById);
export default router;
