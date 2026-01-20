import { IGetListParams, UserRole, UserStatus } from "@/types/common";

export interface IUser {
  userId: string; // BE trả về thông qua $project: { userId: "$_id" }
  name: string;
  avatar?: string | null; // BE có thể trả về null (avatar === "null")
  role: UserRole;
  createdAt: string;
  updatedAt: string;

  // Dữ liệu nhạy cảm (Chỉ trả về nếu isAdminView = true)
  email?: string;
  status?: UserStatus;

  // Thống kê bài viết - Khớp chính xác với cấu trúc cond trong Pipeline của BE
  postCount?: {
    published: number;
    pending?: number; // Chỉ có khi Admin/Owner xem
    total?: number; // Chỉ có khi Admin/Owner xem
  };
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: File | null | string; // Cần File cho upload, null để xóa ảnh
}

export type IGetAdminUsersParams = IGetListParams & {
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  showDeleted?: boolean;
  startDate?: string;
  endDate?: string;
};

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
