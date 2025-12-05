import { redisRateLimiter } from "../config/rateLimit";

// Định nghĩa cấu hình Rate Limit cho từng loại endpoint:
// 1. Limiter chung (100 requests / 15 phút, dùng cho Read/Public)
export const generalLimiter = redisRateLimiter(100, 15 * 60, "rate:general");

// 2. Limiter nhạy cảm (10 requests / 5 phút, dùng cho Write/Auth)
export const sensitiveLimiter = redisRateLimiter(10, 5 * 60, "rate:sensitive");
