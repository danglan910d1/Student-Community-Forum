// src/routes/authRoutes.ts

import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Route cho việc đăng ký người dùng mới
// POST /api/auth/register
router.post("/register", register);

// Route cho việc đăng nhập (lấy token)
// POST /api/auth/login
router.post("/login", login);

// Route lấy thông tin người dùng hiện tại (cần xác thực)
// GET /api/auth/me
router.get("/me", authMiddleware, getMe);

export default router;
