import { z } from "zod";
import { signupSchema } from "../schemas/signUpSchema";
import { loginSchema } from "../schemas/loginSchema";
import { AxiosError } from "axios";

// 1. Dữ liệu từ Form (có confirmPassword để validate UI)
export type SignupFormInput = z.infer<typeof signupSchema>;

// 2. Dữ liệu gửi lên Backend (loại bỏ confirmPassword)
export type SignupRequest = Omit<SignupFormInput, "confirmPassword">;

export type LoginInput = z.infer<typeof loginSchema>;
export type LoginRequest = LoginInput;

// 2. Dữ liệu người dùng (dùng chung cho nhiều nơi)
export interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

// 3. Cấu trúc trả về từ Backend của bạn
export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  token: string;
}

export interface AuthContentProps {
  isPending: boolean;
  // Khai báo chính xác kiểu mà bạn đang có ở ngoài Container
  serverError: AxiosError<{ message: string }> | null;
}
