/**
 * CONTROLLER: authController
 * Trách nhiệm: Xử lý Đăng ký, Đăng nhập, Đăng xuất.
 * Chiến lược: Service-layered, Redis-backed Revocation, IP-based Rate Limiting.
 */
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

/** * POST /api/auth/register */
export const register = asyncHandler(
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { name, email, password } = req.body;
    const userIp = req.ip || "0.0.0.0";

    if (!name || !email || !password)
      throw new AppError(400, "Please enter all fields.");
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(
        400,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
      );
    }

    const { user, token } = await registerService(name, email, password);

    // Xóa giới hạn IP sau khi đăng ký thành công (Phòng trường hợp user bị chặn do thử đăng ký lỗi nhiều lần)
    await clearRateLimitsByIdentifier(userIp, "rate:auth");
    await clearRateLimitsByIdentifier(userIp, "rate:general");

    res.status(201).json({ ...user, token });
  }
);

/** * POST /api/auth/login */
export const login = asyncHandler(
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email, password } = req.body;
    const userIp = req.ip || "0.0.0.0";

    if (!email || !password)
      throw new AppError(400, "Please provide both email and password.");

    // Service này chịu trách nhiệm: Kiểm tra user, verify pass, kiểm tra lockout trong Redis
    const { user, token } = await loginService(email, password, userIp);

    // Giải phóng IP khỏi rate limit nếu login thành công
    await clearRateLimitsByIdentifier(userIp, "rate:auth");
    await clearRateLimitsByIdentifier(userIp, "rate:general");

    res.json({ ...user, token });
  }
);

/** * POST /api/auth/logout */
export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new AppError(401, "Token is required for logout.");

    // logoutService sẽ thực hiện addRevokedToken vào Redis với TTL khớp với thời gian còn lại của JWT
    await logoutService(token);

    res.json({ message: "Logged out successfully." });
  }
);
