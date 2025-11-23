/**
 * MIDDLEWARE: authMiddleware
 * * Trách nhiệm: Xác thực token JWT, trích xuất userId và userRole, gán vào req.
 * * Nguyên tắc JWT: Zero-Lookup (Không truy vấn DB để lấy role).
 */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"; // Thư viện đã có định nghĩa kiểu (@types/jsonwebtoken)
import { AuthenticatedRequest } from "../types/express";

// Lấy secret key từ biến môi trường hoặc dùng giá trị mặc định
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Định nghĩa kiểu payload JWT (Phải khớp với generateToken - hàm mã hoá)
interface JwtPayload {
  id: string;
  role: "user" | "admin";
}

// Middleware kiểm tra và xác thực token JWT
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Lấy token từ header Authorization (dạng: 'Bearer TOKEN')
  const token = req.headers.authorization?.split(" ")[1];

  // 1. Kiểm tra token tồn tại
  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    // 2. Xác thực token và giải mã payload
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 3. Gán ID người dùng đã xác thực vào request object
    (req as AuthenticatedRequest).userId = decoded.id;

    // 4. Gán VAI TRÒ (ROLE) người dùng vào request object (Tối ưu hiệu suất!)
    (req as AuthenticatedRequest).userRole = decoded.role;

    // Chuyển sang middleware hoặc controller tiếp theo
    next();
  } catch (error) {
    // 5. Xử lý lỗi token không hợp lệ (hết hạn, sai chữ ký,...)
    return res.status(401).json({ error: "Invalid token" });
  }
};
