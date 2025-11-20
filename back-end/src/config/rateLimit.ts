// Cấu hình Giới hạn Tốc độ
// Định nghĩa cấu hình cho middleware Rate Limiting (chặn truy cập quá nhiều lần), thường dùng để bảo vệ các route nhạy cảm như /login và /register

import rateLimit from "express-rate-limit";

// Cấu hình giới hạn tốc độ truy cập cho các route Public/Auth
export const generalRateLimiter = rateLimit({
  // Chỉ cho phép 100 request trong 15 phút từ cùng một IP
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    code: 429,
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true, // Thêm header RateLimit-Limit và RateLimit-Remaining
  legacyHeaders: false, // Tắt header X-RateLimit-*
});

// Cấu hình giới hạn nghiêm ngặt hơn cho các route nhạy cảm (ví dụ: login, register)
export const sensitiveRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Chỉ 10 request trong 5 phút
  message: {
    code: 429,
    error: "Too many authentication attempts. Try again in 5 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
