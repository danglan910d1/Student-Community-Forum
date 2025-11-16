// src/routes/authRoutes.ts

import { Router } from "express";
import { register, login, logout } from "../controllers/authController";

const router = Router();

// Route cho việc đăng ký người dùng mới
// POST /api/auth/register
router.post("/register", register);

// Route cho việc đăng nhập (lấy token)
// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/logout (Không cần middleware)
router.post("/logout", logout);

export default router;
