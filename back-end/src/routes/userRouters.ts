// src/routes/userRoutes.ts (Prefix: /api/users)

import { Router } from "express";
import {
  getMe,
  updateProfile,
  updatePassword,
  getUserById,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getUsersList,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/auth"; // auth.ts
import { adminMiddleware } from "../middleware/admin";
import { generalRateLimiter } from "../config/rateLimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// USER
// GET /api/users/me (Lấy thông tin profile của chính mình)
// Ép kiểu: Báo cho TypeScript rằng getMe được truyền vào một Request
// đã được xử lý bởi authMiddleware và đã đủ điều kiện là AuthenticatedRequest.
router.get("/me", generalRateLimiter, authMiddleware, getMe);

// PUT /api/users/profile (Cập nhật tên, avatar)
router.put(
  "/profile",
  generalRateLimiter,
  authMiddleware,
  preventDuplicateRequest,
  updateProfile
);

// PUT /api/users/password (Đổi mật khẩu)
router.put(
  "/password",
  generalRateLimiter,
  authMiddleware,
  preventDuplicateRequest,
  updatePassword
);

// DELETE /api/users/me (XÓA TÀI KHOẢN CỦA CHÍNH MÌNH)
router.delete(
  "/me",
  generalRateLimiter,
  authMiddleware,
  preventDuplicateRequest,
  deleteUser
);

// PUBLIC
// GET /api/users (Tìm kiếm users công khai theo tên)
router.get("/", generalRateLimiter, getUsersList);

// --- [ ROUTES DÀNH CHO ADMIN ] ---
// GET /api/users/admin (Lấy danh sách tất cả Users)
// KHÔNG CẦN adminMiddleware vì đã kiểm tra role bên trong Controller.
// Tuy nhiên, ta vẫn giữ authMiddleware để gán userId/userRole.
router.get(
  "/admin",
  generalRateLimiter,
  authMiddleware, // Bắt buộc đăng nhập để thấy endpoint này rõ ràng hơn
  getUsersList
);

// GET /api/users/:id/details (Xem chi tiết dành cho admin)
router.get(
  "/:id/details",
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  // Xóa bỏ hoàn toàn mối quan hệ phức tạp giữa kiểu hàm và RequestHandler
  // Sau khi giá trị đã là unknown, có thể ép kiểu nó thành bất kỳ kiểu nào khác (trong trường hợp này là RequestHandler), bởi vì unknown cho phép ép kiểu.Sau khi giá trị đã là unknown, bạn có thể ép kiểu nó thành bất kỳ kiểu nào khác (trong trường hợp này là RequestHandler), bởi vì unknown cho phép ép kiểu.
  getUserDetails
);

// PUT /api/users/:id/status (Cấm/Mở khóa tài khoản VÀ THAY ĐỔI ROLE)
// Hàm Controller updateUserStatus đã được cấu hình để xử lý cả status và role từ body.
router.put(
  "/:id/status",
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  updateUserStatus
);

// DELETE /api/users/:id (XÓA TÀI KHOẢN NGƯỜI DÙNG KHÁC)
// Giữ nguyên logic Admin để xóa người khác.
router.delete(
  "/:id",
  generalRateLimiter,
  authMiddleware,
  adminMiddleware,
  preventDuplicateRequest,
  deleteUser
);

// GET /api/users/:id (Xem hồ sơ công khai của người khác)
router.get("/:id", generalRateLimiter, getUserById);

export default router;
