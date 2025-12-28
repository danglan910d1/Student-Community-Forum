import { Types } from "mongoose";
import { UserStatus } from "../../models/User";

export type GlobalStatus = "pending" | "approved" | "rejected";

export interface CommonQuery {
  status?: GlobalStatus | UserStatus | string;
  search?: string;
  myPosts?: string;
  page?: string;
  limit?: string;
  showDeleted?: string; // Bổ sung để Admin có thể xem thùng rác
}

export interface AuthContext {
  userId?: string | undefined;
  isAdmin: boolean;
}

/**
 * buildCommonFilter: Xây dựng bộ lọc MongoDB dùng chung cho toàn bộ hệ thống.
 */
export const buildCommonFilter = (
  queryParams: CommonQuery,
  authContext: AuthContext,
  modelType: "post" | "topic" | "tag" | "user" | "comment"
) => {
  const { status, search, myPosts, showDeleted } = queryParams;
  const { userId, isAdmin } = authContext;

  const filter: any = {};

  // --- 1. XỬ LÝ SOFT DELETE (is_deleted) ---
  // Nếu là Admin và muốn xem thùng rác
  if (isAdmin && showDeleted === "true") {
    filter.is_deleted = true;
  } else {
    // Mặc định luôn lấy các bản ghi chưa xóa.
    // Dùng $ne true để an toàn cho cả các bản ghi cũ chưa kịp update field is_deleted
    filter.is_deleted = { $ne: true };
  }

  // --- 2. LOGIC TRUY CẬP THEO QUYỀN HẠN & TRẠNG THÁI ---
  const isViewingOwnContent = myPosts === "true" && userId;

  if (isViewingOwnContent) {
    // TRƯỜNG HỢP 1: XEM NỘI DUNG CỦA CHÍNH MÌNH (Profile/My Posts)
    if (modelType === "user") {
      filter._id = new Types.ObjectId(userId);
    } else {
      const creatorField =
        modelType === "post" || modelType === "comment"
          ? "userId"
          : "createdBy";
      filter[creatorField] = new Types.ObjectId(userId);
      // Tự xem bài mình thì thấy cả bài đang chờ duyệt hoặc bị từ chối
      filter.status = { $in: ["pending", "approved", "rejected"] };
    }
  } else {
    // TRƯỜNG HỢP 2: XEM DANH SÁCH (CÔNG KHAI HOẶC ADMIN QUẢN LÝ)

    // A. Xử lý riêng cho USER
    if (modelType === "user") {
      if (isAdmin) {
        const validUserStatuses: UserStatus[] = ["active", "banned"];
        if (status && validUserStatuses.includes(status as UserStatus)) {
          filter.status = status;
        }
      } else {
        // Public chỉ được thấy User đang hoạt động
        filter.status = "active";
      }
    }
    // B. Xử lý cho CONTENT (Post, Topic, Tag, Comment)
    else {
      if (isAdmin) {
        const validContentStatuses: GlobalStatus[] = [
          "pending",
          "approved",
          "rejected",
        ];
        if (status && validContentStatuses.includes(status as GlobalStatus)) {
          filter.status = status;
        }
      } else {
        // Public chỉ được thấy nội dung đã phê duyệt
        filter.status = "approved";
      }
    }
  }

  // --- 3. TÌM KIẾM TỪ KHÓA ---
  if (search) {
    // Lưu ý: Để dùng $text, bạn phải tạo Text Index trong Mongoose Schema
    filter.$text = { $search: search as string };
  }

  return filter;
};
