// src/routes/authRoutes.ts
// prefix: /api/auth

import { Router } from "express";
import { register, login, logout } from "../controllers/authController";
import { authLimiter, logoutLimiter } from "../middleware/ratelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// Route cho việc đăng ký người dùng mới
// Route Đăng ký và Đăng nhập CHỈ giới hạn theo IP (Dùng generalLimiter hoặc
// một Limiter riêng biệt cho các Auth endpoint)
// POST /api/auth/register
router.post("/register", authLimiter, preventDuplicateRequest, register);

// Route cho việc đăng nhập (lấy token)
// POST /api/auth/login
router.post("/login", authLimiter, preventDuplicateRequest, login);

// POST /api/auth/logout (Không cần middleware)
router.post("/logout", logoutLimiter, logout);

export default router;
