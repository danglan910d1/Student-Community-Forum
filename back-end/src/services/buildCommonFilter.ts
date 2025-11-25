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
// export const buildCommonFilter = (
//   queryParams: CommonQuery,
//   authContext: AuthContext,
//   modelType: "post" | "topic" | "tag" // Cần biết loại model
// ) => {
//   const { status, search, myPosts } = queryParams;
//   const { userId, isAdmin } = authContext;

//   const filter: any = { is_deleted: false }; // Giả định tất cả đều có is_deleted

//   // --- 1. LOGIC TRUY CẬP STATUS & USER ID ---

//   const isViewingOwnContent = myPosts === "true" && userId;

//   if (isViewingOwnContent) {
//     // NOTE: Giả định trường người tạo là 'createdBy' cho Topic/Tag và 'userId' cho Post (Logic sẽ phức tạp nếu tên trường khác nhau)
//     filter[modelType === "post" ? "userId" : "createdBy"] = new Types.ObjectId(
//       userId
//     );

//     // Cho phép xem tất cả trạng thái của nội dung mình tạo ra (pending, approved, rejected)
//     filter.status = { $in: ["pending", "approved", "rejected"] };
//   } else if (isAdmin) {
//     // ADMIN: Lọc tất cả nội dung trên hệ thống theo Status bất kỳ
//     // Nếu không truyền status, Admin được xem tất cả status, không cần thêm filter.status
//     if (status) {
//       const validStatuses: GlobalStatus[] = ["pending", "approved", "rejected"];
//       if (validStatuses.includes(status as GlobalStatus)) {
//         filter.status = status;
//       } else {
//         throw new Error("Invalid status value.");
//       }
//     }
//   } else {
//     // PUBLIC: Mặc định chỉ thấy nội dung đã "approved"
//     filter.status = "approved";
//   }

//   // --- 2. TÌM KIẾM TỪ KHÓA (CHUNG CHO TẤT CẢ MODEL) ---
//   if (search) {
//     filter.$text = { $search: search as string };
//   }

//   return filter;
// };
export const buildCommonFilter = (
  queryParams: CommonQuery,
  authContext: AuthContext,
  modelType: "post" | "topic" | "tag"
) => {
  const { status, search, myPosts } = queryParams;
  const { userId, isAdmin } = authContext;

  const filter: any = { is_deleted: false }; // --- 1. LOGIC TRUY CẬP STATUS & USER ID ---

  const isViewingOwnContent = myPosts === "true" && userId;
  // Thêm vào đầu buildCommonFilter
  console.log("AuthContext:", authContext);
  console.log("myPosts query:", myPosts);
  console.log("isViewingOwnContent:", myPosts === "true" && userId);

  if (isViewingOwnContent) {
    // TRƯỜNG HỢP 1: XEM BÀI CỦA CHÍNH MÌNH (ADMIN HOẶC USER)
    filter[modelType === "post" ? "userId" : "createdBy"] = new Types.ObjectId(
      userId
    ); // Cho phép xem TẤT CẢ trạng thái (pending, approved, rejected)
    filter.status = { $in: ["pending", "approved", "rejected"] };
  } else if (isAdmin) {
    // TRƯỜNG HỢP 2: ADMIN XEM BÀI CỦA NGƯỜI KHÁC HOẶC TẤT CẢ HỆ THỐNG
    // Nếu Admin không truyền status, Admin xem TẤT CẢ status (không cần thêm filter.status)
    if (status) {
      // Nếu có status, Admin lọc theo status đó
      const validStatuses: GlobalStatus[] = ["pending", "approved", "rejected"];
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
  } // --- 2. TÌM KIẾM TỪ KHÓA ---

  if (search) {
    filter.$text = { $search: search as string };
  }

  return filter;
};
