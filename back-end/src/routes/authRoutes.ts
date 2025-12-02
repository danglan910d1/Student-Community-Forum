// src/routes/authRoutes.ts
// prefix: /api/auth

import { Router } from "express";
import { register, login, logout } from "../controllers/authController";
import { generalLimiter, sensitiveLimiter } from "../middleware/reatelimit";
import { preventDuplicateRequest } from "../middleware/idempotency";

const router = Router();

// Route cho việc đăng ký người dùng mới
// POST /api/auth/register
router.post("/register", sensitiveLimiter, preventDuplicateRequest, register);

// Route cho việc đăng nhập (lấy token)
// POST /api/auth/login
router.post("/login", sensitiveLimiter, preventDuplicateRequest, login);

// POST /api/auth/logout (Không cần middleware)
router.post("/logout", generalLimiter, logout);

export default router;
