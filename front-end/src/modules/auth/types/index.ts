import { z } from "zod";
import { signupSchema } from "@/modules/auth/schemas/signUpSchema";
import { loginSchema } from "@/modules/auth/schemas/loginSchema";
import { AxiosError } from "axios";
import { IAuthor, IGetListParams, UserRole, UserStatus } from "@/types/common";

// 1. Dữ liệu từ Form (có confirmPassword để validate UI)
export type SignupFormInput = z.infer<typeof signupSchema>;

// 2. Dữ liệu gửi lên Backend (loại bỏ confirmPassword)
export type SignupRequest = Omit<SignupFormInput, "confirmPassword">;

export type LoginInput = z.infer<typeof loginSchema>;
export type LoginRequest = LoginInput;

// 2. Dữ liệu người dùng (dùng chung cho nhiều nơi)
export interface IUser {
  userId: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;

  // Chỉ Admin mới thấy
  email?: string;
  status?: UserStatus;

  // Thống kê bài viết (postStats trong Pipeline)
  postCount?: {
    published: number;
    pending?: number; // Chỉ Admin/Owner thấy
    total?: number; // Chỉ Admin/Owner thấy
  };
}

// 3. Cấu trúc trả về từ Backend (Dùng IAuthor để đồng bộ)
export interface AuthResponse extends IAuthor {
  token: string;
}

export interface AuthContentProps {
  isPending: boolean;
  // Khai báo chính xác kiểu mà bạn đang có ở ngoài Container
  serverError: AxiosError<{ message: string }> | null;
}

// Thống nhất Filter Params cho Admin quản lý User
export type IGetUsersParams = IGetListParams;
export interface IGetAdminUsersParams extends IGetUsersParams {
  email?: string; // Backend: delete filter.$text để tìm chính xác email
  role?: UserRole;
  status?: UserStatus;
  showDeleted?: boolean;
}
