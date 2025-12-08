import { Types } from "mongoose";

// Định nghĩa các loại Status chung áp dụng cho nhiều Model (Post, Topic, Tag)
// Đặt tên GlobalStatus để tránh phụ thuộc vào PostStatus
export type GlobalStatus = "pending" | "approved" | "rejected";

// Định nghĩa Type Query Parameters chung (Chỉ chứa các tham số chung)
export interface CommonQuery {
  status?: GlobalStatus;
  search?: string;
  myPosts?: string; // Dùng 'true'/'false'
  page?: string;
  limit?: string;
}

// Định nghĩa Context xác thực (không liên quan đến Model)
export interface AuthContext {
  userId?: string | undefined;
  isAdmin: boolean;
}

/**
 * Xây dựng các filter cơ bản dựa trên quyền hạn người dùng và các tham số query chung.
 * Hàm này dùng cho cả Post, Tag, Topic.
 * @param queryParams - req.query (Chỉ chứa các tham số chung)
 * @param authContext - Context xác thực
 * @param modelType - Loại Model đang được lọc (để biết cách xử lý status, ví dụ: 'post' hoặc 'topic')
 * @returns Object filter MongoDB
 */

export const buildCommonFilter = (
  queryParams: CommonQuery,
  authContext: AuthContext,
  modelType: "post" | "topic" | "tag" | "user" | "comment"
) => {
  const { status, search, myPosts } = queryParams;
  const { userId, isAdmin } = authContext;

  const filter: any = { is_deleted: false };

  // --- 1. LOGIC TRUY CẬP STATUS & USER ID ---

  const isViewingOwnContent = myPosts === "true" && userId;

  if (isViewingOwnContent) {
    // TRƯỜNG HỢP 1: XEM NỘI DUNG CỦA CHÍNH MÌNH (Lọc theo ID)

    // 1a. Lọc theo ID người tạo/người dùng
    if (modelType === "user") {
      // Nếu là User Model, chỉ lọc chính user đó
      filter._id = new Types.ObjectId(userId);
    } else {
      // Áp dụng lọc theo người tạo cho các model nội dung khác
      const creatorField =
        modelType === "post" || modelType === "comment"
          ? "userId" // Dùng userId cho Post/Comment
          : "createdBy"; // Dùng createdBy cho Topic/Tag
      filter[creatorField] = new Types.ObjectId(userId);
    }

    // 1b. Logic Status (chỉ áp dụng cho các model có status GlobalStatus)
    if (modelType !== "user") {
      // Cho phép xem TẤT CẢ trạng thái (pending, approved, rejected)
      filter.status = { $in: ["pending", "approved", "rejected"] };
    }
  } else if (modelType !== "user") {
    // TRƯỜNG HỢP 2 & 3: Lọc Status cho model nội dung khác (không phải của mình)

    if (isAdmin) {
      // TRƯỜNG HỢP 2: ADMIN XEM BÀI CỦA NGƯỜI KHÁC HOẶC TẤT CẢ HỆ THỐNG
      if (status) {
        const validStatuses: GlobalStatus[] = [
          "pending",
          "approved",
          "rejected",
        ];
        if (validStatuses.includes(status as GlobalStatus)) {
          filter.status = status;
        } else {
          throw new Error("Invalid status value.");
        }
      }
    } else {
      // TRƯỜNG HỢP 3: PUBLIC / USER XEM BÀI CÔNG KHAI
      // Chỉ thấy nội dung đã "approved"
      filter.status = "approved";
    }
  }
  // Logic Status bị bỏ qua hoàn toàn nếu modelType === "user" và myPosts !== "true".

  // --- 2. TÌM KIẾM TỪ KHÓA ---
  if (search) {
    filter.$text = { $search: search as string };
  }

  return filter;
};
