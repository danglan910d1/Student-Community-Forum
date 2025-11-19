// src/routes/userRoutes.ts (Prefix: /api/users)

import { Router, RequestHandler } from "express";
import {
  getMe,
  updateProfile,
  updatePassword,
  getUserById,
  getUserDetails,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/auth"; // auth.ts
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// GET /api/users/me (Lấy thông tin profile của chính mình)
// Ép kiểu: Báo cho TypeScript rằng getMe được truyền vào một Request
// đã được xử lý bởi authMiddleware và đã đủ điều kiện là AuthenticatedRequest.
router.get("/me", authMiddleware, getMe as RequestHandler);

// PUT /api/users/profile (Cập nhật tên, avatar)
router.put("/profile", authMiddleware, updateProfile as RequestHandler);

// PUT /api/users/password (Đổi mật khẩu)
router.put("/password", authMiddleware, updatePassword as RequestHandler);

// GET /api/users/:id (Xem hồ sơ công khai của người khác)
router.get("/:id", getUserById);

// --- [ ROUTES DÀNH CHO ADMIN ] ---
// GET /api/users/:id/details (Xem chi tiết dành cho admin)
router.get(
  "/:id/details",
  authMiddleware,
  adminMiddleware,
  // Xóa bỏ hoàn toàn mối quan hệ phức tạp giữa kiểu hàm và RequestHandler
  // Sau khi giá trị đã là unknown, có thể ép kiểu nó thành bất kỳ kiểu nào khác (trong trường hợp này là RequestHandler), bởi vì unknown cho phép ép kiểu.Sau khi giá trị đã là unknown, bạn có thể ép kiểu nó thành bất kỳ kiểu nào khác (trong trường hợp này là RequestHandler), bởi vì unknown cho phép ép kiểu.
  getUserDetails as unknown as RequestHandler
);

// PUT /api/users/:id/status (Cấm/Mở khóa tài khoản)
router.put(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateUserStatus as unknown as RequestHandler
);

// DELETE /api/users/:id (Xóa tài khoản người dùng khác)
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser as unknown as RequestHandler
);

export default router;
