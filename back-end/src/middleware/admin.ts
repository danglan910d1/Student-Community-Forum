import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/express";
// KHÔNG cần import Users, KHÔNG cần truy vấn DB

// Middleware kiểm tra quyền Admin (Zero-Lookup)
export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Giả định: authMiddleware đã chạy trước và gán userId/userRole
  const userRole = (req as AuthenticatedRequest).userRole; // 1. Kiểm tra quyền Admin

  if (userRole === "admin") {
    // Nếu là Admin, cho phép đi tiếp
    next();
  } else {
    // Nếu không phải Admin hoặc User không tồn tại/role không đủ
    res.status(403).json({ error: "Access denied. Admin rights required." });
  }
};
