import { Request, Response, NextFunction } from "express";
import Users from "../models/User";
import { AuthenticatedRequest } from "../types/express";

// Middleware kiểm tra quyền Admin
export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Giả định: auth đã chạy trước và gán userId vào req.
  // Lấy userId từ req.
  const userId = (req as AuthenticatedRequest).userId;

  if (!userId) {
    return res.status(403).json({ error: "Access denied. User ID not found." });
  }

  try {
    // 1. Tìm User trong CSDL
    const user = await Users.findById(userId);

    // 2. Kiểm tra quyền Admin
    if (user && user.role === "admin") {
      // Nếu là Admin, cho phép đi tiếp
      next();
    } else {
      // Nếu không phải Admin hoặc User không tồn tại
      res.status(403).json({ error: "Access denied. Admin rights required." });
    }
  } catch (error) {
    console.error(error); // Log lỗi server
    res.status(500).json({ error: "Server error during authorization check." });
  }
};
