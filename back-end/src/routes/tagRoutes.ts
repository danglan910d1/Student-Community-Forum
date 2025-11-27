import { Router } from "express";
import {
  getTagsList,
  updateTag,
  getTagById,
  deleteTag,
} from "../controllers/tagController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// --- [ PUBLIC/USER ] ---
// GET /api/tags (Lấy tất cả tags đã được duyệt, có thể lọc theo topicId)
router.get("/", getTagsList); // Gọi hàm gộp chung (Public)

// POST /api/tags (User gợi ý tag mới được chuyển sang createPost)
// router.post(
//   "/",
//   authMiddleware, // Cần xác thực để biết ai là người gợi ý (createdBy)
//   suggestTag
// );

// --- [ ADMIN ONLY ] ---
// GET /api/tags/admin (Lấy tất cả tags, bao gồm cả pending) <-- Dùng lại hàm gộp
router.get("/admin", authMiddleware, adminMiddleware, getTagsList);

// GET /api/tags/admin/:id (Lấy chi tiết Tag bằng ID)
router.get("/admin/:id", authMiddleware, adminMiddleware, getTagById);

// PUT /api/tags/admin/:id (Cập nhật tag, bao gồm cả duyệt status)
router.put("/admin/:id", authMiddleware, adminMiddleware, updateTag);

// DELETE /api/tags/admin/:id (Xóa Tag)
router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteTag);

export default router;
