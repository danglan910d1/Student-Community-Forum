import { Request, Response, NextFunction } from "express";
import * as crypto from "crypto";

// Sử dụng một Set toàn cục để mô phỏng lưu trữ Idempotency Key trong Redis.
// LƯU Ý: Phải dùng Redis/Memcached/store chung cho môi trường đa server.
declare global {
  var processingRequests: Set<string>;
}

if (!global.processingRequests) {
  global.processingRequests = new Set<string>();
}

/**
 * Middleware chống Duplicate Request bằng Idempotency Key (x-request-id).
 * Chỉ nên áp dụng cho các route POST/PUT có tác dụng phụ (side effects).
 */
export const preventDuplicateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Lấy hoặc tạo Idempotency Key
  let requestId = req.headers["x-request-id"] as string;

  if (!requestId) {
    // Tự động tạo Key nếu client quên gửi (nên yêu cầu client gửi)
    requestId = crypto.randomUUID();
    req.headers["x-request-id"] = requestId;
    console.warn(`[IDEMPOTENCY] Generated new request ID: ${requestId}`);
  }

  // 2. Kiểm tra trạng thái Request
  if (global.processingRequests.has(requestId)) {
    console.warn(`[IDEMPOTENCY] Duplicate request blocked: ${requestId}`);
    // Mã 429: Too Many Requests
    return res
      .status(429)
      .json({ error: "Duplicate request detected. Please wait." });
  }

  // 3. Đánh dấu Request đang xử lý
  global.processingRequests.add(requestId);

  // 4. Đảm bảo xóa Key khi Request hoàn tất (dù thành công hay thất bại)
  res.on("finish", () => {
    global.processingRequests.delete(requestId);
    console.log(`[IDEMPOTENCY] Request finished, key removed: ${requestId}`);
  });

  next();
};
