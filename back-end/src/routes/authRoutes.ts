// src/routes/authRoutes.ts
// prefix: /api/auth

import { Router } from "express";
import { register, login, logout } from "../controllers/authController";
import { generalRateLimiter } from "../config/rateLimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// Route cho việc đăng ký người dùng mới
// POST /api/auth/register
router.post("/register", generalRateLimiter, preventDuplicateRequest, register);

// Route cho việc đăng nhập (lấy token)
// POST /api/auth/login
router.post("/login", generalRateLimiter, preventDuplicateRequest, login);

// POST /api/auth/logout (Không cần middleware)
router.post("/logout", generalRateLimiter, logout);

export default router;
