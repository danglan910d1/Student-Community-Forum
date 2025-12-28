// src/controllers/authController.ts
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { MIN_PASSWORD_LENGTH } from "../config/constants";
import { LoginBody, RegisterBody } from "../types/user";
import { clearRateLimitsByIdentifier } from "../services/common/redis";
import { AuthenticatedRequest } from "../types/express";
import {
  loginService,
  logoutService,
  registerService,
} from "../services/users/authlLayer";
import { AppError } from "../utils/appError";

// Đăng ký tài khoản
export const register = asyncHandler(
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { name, email, password } = req.body;

    // Validation cơ bản (Ném lỗi trực tiếp, không cần return res.status)
    if (!name || !email || !password) {
      throw new AppError(400, "Please enter all fields.");
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(
        400,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
      );
    }

    // Gọi Service - Mọi lỗi logic bên trong sẽ tự "trôi" về Global Handler
    const { user, token } = await registerService(name, email, password);

    // Xử lý hậu kỳ thành công
    if (req.ip) {
      await clearRateLimitsByIdentifier(req.ip, "rate:auth");
      await clearRateLimitsByIdentifier(req.ip, "rate:general");
    }

    res.status(201).json({ ...user, token });
  }
);
// Đăng nhập tài khoản
export const login = asyncHandler(
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email, password } = req.body;
    const userIp = req.ip || "0.0.0.0";

    if (!email || !password) {
      throw new AppError(400, "Please provide both email and password.");
    }

    // Logic xác thực phức tạp đã được Service lo hết
    const { user, token } = await loginService(email, password, userIp);

    // Nếu chạy đến đây tức là không có lỗi nào được ném ra (Login thành công)
    await clearRateLimitsByIdentifier(userIp, "rate:auth");
    await clearRateLimitsByIdentifier(userIp, "rate:general");

    res.json({ ...user, token });
  }
);

// Đằng xuất (Stateless - Phi trạng thái)
// (Sử dụng Redis để thu hồi Token)
// export const logout = (req: Request, res: Response) => {
//   // Frontend xóa token, Backend chỉ cần phản hồi thành công.
//   res.json({ message: "Logged out successfully." });
// };

// src/controllers/authController.ts

export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // 1. Lấy token thô từ header (đã được format 'Bearer <token>')
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError(401, "Token is required for logout.");
    }

    // 2. Gọi Service xử lý thu hồi
    await logoutService(token);

    console.log(`[LOGOUT] Token revoked for user: ${req.userId}`);

    // 3. Phản hồi thành công
    res.json({ message: "Logged out successfully." });
  }
);
