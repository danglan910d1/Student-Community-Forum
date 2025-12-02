import * as redis from "redis";

// Khởi tạo client Redis
// Đảm bảo cấu hình kết nối được lấy từ biến môi trường (ví dụ: REDIS_URL)
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Kết nối Redis
async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected successfully.");
  }
}

// Khởi tạo và kết nối khi ứng dụng bắt đầu
connectRedis();

/**
 * Lấy dữ liệu từ cache theo key
 * @param key Khóa cache
 * @returns JSON object hoặc null
 */
export async function getCache(key: string): Promise<any | null> {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Error fetching cache for key ${key}:`, e);
    return null;
  }
}

/**
 * Lưu dữ liệu vào cache
 * @param key Khóa cache
 * @param value Dữ liệu cần lưu (Object)
 * @param expirationInSeconds Thời gian sống (TTL) của cache
 */
export async function setCache(
  key: string,
  value: any,
  expirationInSeconds: number = 3600
): Promise<void> {
  try {
    const data = JSON.stringify(value);
    await redisClient.setEx(key, expirationInSeconds, data);
  } catch (e) {
    console.error(`Error setting cache for key ${key}:`, e);
  }
}

/**
 * Xóa cache theo pattern (ví dụ: 'posts:*')
 * @param pattern Pattern key (ví dụ: 'posts:*')
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated ${keys.length} keys matching ${pattern}`);
    }
  } catch (e) {
    console.error(`Error invalidating cache for pattern ${pattern}:`, e);
  }
}

/**
 * Tăng View Count cho Post
 * @param postId ID của bài viết
 */
export async function incrementPostView(postId: string): Promise<void> {
  // Sử dụng INCR để tăng giá trị, TTL để tự động xóa key sau 1 ngày (ví dụ)
  const key = `views:${postId}`;
  const result = await redisClient.incr(key);

  // Đặt TTL chỉ khi view là 1 (key mới) để tránh reset bộ đếm
  if (result === 1) {
    await redisClient.expire(key, 86400); // 24 giờ
  }
}

// ----------------------------------------------------------------------
// CÁC HÀM XỬ LÝ LIKES (Dùng Sets để lưu ID người dùng đã thích)
// ----------------------------------------------------------------------

const LIKE_KEY = (postId: string) => `likes:post:${postId}`;

/**
 * Thêm hoặc xóa User ID khỏi tập hợp Likes của Post
 * @param postId ID Bài viết
 * @param userId ID Người dùng
 * @param action 'add' để thích, 'remove' để bỏ thích
 * @returns 1 nếu thành công, 0 nếu không thay đổi
 */
export async function togglePostLike(
  postId: string,
  userId: string,
  action: "add" | "remove"
): Promise<number> {
  const key = LIKE_KEY(postId);
  if (action === "add") {
    // SADD: Thêm thành viên vào tập hợp
    return redisClient.sAdd(key, userId);
  } else {
    // SREM: Loại bỏ thành viên khỏi tập hợp
    return redisClient.sRem(key, userId);
  }
}

/**
 * Lấy số lượng Likes hiện tại từ Redis
 * @param postId ID Bài viết
 */
export async function getPostLikeCount(postId: string): Promise<number> {
  const key = LIKE_KEY(postId);
  // SCARD: Lấy số lượng thành viên trong tập hợp
  return redisClient.sCard(key);
}

// ----------------------------------------------------------------------
// CÁC HÀM XỬ LÝ RATE LIMITING (Sử dụng INCR và EXPIRE)
// ----------------------------------------------------------------------

/**
 * Kiểm tra và giới hạn số lần truy cập dựa trên IP/ID.
 * @param keyPrefix Tiền tố khóa (ví dụ: 'rate:ip', 'rate:user')
 * @param identifier IP hoặc User ID
 * @param limit Số lần truy cập tối đa
 * @param windowInSeconds Khung thời gian (ví dụ: 60s)
 * @returns true nếu còn lượt, false nếu vượt quá giới hạn
 */
export async function checkRateLimit(
  keyPrefix: string,
  identifier: string,
  limit: number,
  windowInSeconds: number
): Promise<boolean> {
  const key = `${keyPrefix}:${identifier}`;

  // INCR: Tăng bộ đếm và trả về giá trị mới
  const currentCount = await redisClient.incr(key);

  // Đặt TTL (Thời gian sống) cho key chỉ khi nó là 1 (key mới)
  if (currentCount === 1) {
    await redisClient.expire(key, windowInSeconds);
  }

  return currentCount <= limit;
}

// ----------------------------------------------------------------------
// CÁC HÀM XỬ LÝ DỮ LIỆU NGƯỜI DÙNG
// ----------------------------------------------------------------------

/**
 * Lưu thông tin người dùng vào cache (Ví dụ: Profile cơ bản, vai trò)
 * @param userId ID người dùng
 * @param userData Dữ liệu người dùng cần lưu (Object)
 * @param expirationInSeconds Thời gian sống (TTL) của cache (Mặc định 1 giờ)
 */
export async function cacheUser(
  userId: string,
  userData: any,
  expirationInSeconds: number = 3600
): Promise<void> {
  const key = `user:profile:${userId}`;
  await setCache(key, userData, expirationInSeconds);
}

/**
 * Lấy thông tin người dùng từ cache
 * @param userId ID người dùng
 * @returns Dữ liệu người dùng hoặc null
 */
export async function getCacheUser(userId: string): Promise<any | null> {
  const key = `user:profile:${userId}`;
  return getCache(key);
}

export default redisClient;
