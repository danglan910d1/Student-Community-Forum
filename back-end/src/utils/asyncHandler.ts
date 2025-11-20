import { Request, Response, NextFunction, RequestHandler } from "express";

// Định nghĩa kiểu cho các Controller (hàm xử lý bất đồng bộ)
type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Hàm bọc để tự động bắt lỗi cho các Controller bất đồng bộ (async/await).
 * @param fn - Hàm Controller gốc
 */
export const asyncHandler =
  (fn: AsyncController): RequestHandler =>
  (req, res, next) => {
    // Trả về promise và bắt lỗi. Nếu có lỗi, chuyển nó đến Express Error Handler (next(error)).
    Promise.resolve(fn(req, res, next)).catch(next);
  };
