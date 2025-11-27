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

const router = Router();

// USER
// GET /api/users/me (Lấy thông tin profile của chính mình)
// Ép kiểu: Báo cho TypeScript rằng getMe được truyền vào một Request
// đã được xử lý bởi authMiddleware và đã đủ điều kiện là AuthenticatedRequest.
router.get("/me", authMiddleware, getMe);

// PUT /api/users/profile (Cập nhật tên, avatar)
router.put("/profile", authMiddleware, updateProfile);

// PUT /api/users/password (Đổi mật khẩu)
router.put("/password", authMiddleware, updatePassword);

// DELETE /api/users/me (XÓA TÀI KHOẢN CỦA CHÍNH MÌNH)
router.delete("/me", authMiddleware, deleteUser);

// PUBLIC
// GET /api/users (Tìm kiếm users công khai theo tên)
router.get("/", getUsersList);

// --- [ ROUTES DÀNH CHO ADMIN ] ---
// GET /api/users/admin (Lấy danh sách tất cả Users)
// KHÔNG CẦN adminMiddleware vì đã kiểm tra role bên trong Controller.
// Tuy nhiên, ta vẫn giữ authMiddleware để gán userId/userRole.
router.get(
  "/admin",
  authMiddleware, // Bắt buộc đăng nhập để thấy endpoint này rõ ràng hơn
  getUsersList
);

// GET /api/users/:id/details (Xem chi tiết dành cho admin)
router.get(
  "/:id/details",
  authMiddleware,
  adminMiddleware,
  // Xóa bỏ hoàn toàn mối quan hệ phức tạp giữa kiểu hàm và RequestHandler
  // Sau khi giá trị đã là unknown, có thể ép kiểu nó thành bất kỳ kiểu nào khác (trong trường hợp này là RequestHandler), bởi vì unknown cho phép ép kiểu.Sau khi giá trị đã là unknown, bạn có thể ép kiểu nó thành bất kỳ kiểu nào khác (trong trường hợp này là RequestHandler), bởi vì unknown cho phép ép kiểu.
  getUserDetails
);

// PUT /api/users/:id/status (Cấm/Mở khóa tài khoản VÀ THAY ĐỔI ROLE)
// Hàm Controller updateUserStatus đã được cấu hình để xử lý cả status và role từ body.
router.put("/:id/status", authMiddleware, adminMiddleware, updateUserStatus);

// DELETE /api/users/:id (XÓA TÀI KHOẢN NGƯỜI DÙNG KHÁC)
// Giữ nguyên logic Admin để xóa người khác.
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

// GET /api/users/:id (Xem hồ sơ công khai của người khác)
router.get("/:id", getUserById);

export default router;
