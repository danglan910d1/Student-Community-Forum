// src/features/auth/utils/auth-handlers.ts
import { AxiosError } from "axios";
import { AuthResponse, User } from "../types";

export const authResponseHandle = {
  // 1. Xử lý khi thành công (Lưu store)
  handleSuccess: (
    response: AuthResponse,
    setAuth: (user: User, token: string) => void
  ) => {
    const { token, ...userData } = response;
    setAuth(userData, token);
    return userData.name; // Trả về tên để hiện Toast
  },

  // 2. Xử lý khi thất bại (Trích xuất lỗi)
  handleError: (error: unknown): string => {
    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
    }>;

    // Ưu tiên trường 'error' từ BE
    const serverMessage =
      axiosError.response?.data?.error || axiosError.response?.data?.message;

    if (serverMessage) return serverMessage;

    if (axiosError.message === "Network Error") return "Lỗi kết nối mạng";
    return "Có lỗi xảy ra, vui lòng thử lại!";
  },
};
