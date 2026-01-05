// src/features/auth/utils/auth-handlers.ts
import { AxiosError } from "axios";
import { AuthResponse } from "@/modules/auth/types";
import { IAuthor } from "@/types/common";

export const authResponseHandle = {
  handleSuccess: (
    response: AuthResponse,
    setAuth: (user: IAuthor, token: string) => void
  ) => {
    // Trích xuất token, các trường còn lại sẽ gom vào userData (kiểu IAuthor)
    const { token, ...userData } = response;

    // Gọi store để lưu
    setAuth(userData, token);

    return userData.name;
  },

  handleError: (error: unknown): string => {
    // Kiểm tra lỗi Axios một cách an toàn
    if (error && typeof error === "object" && "isAxiosError" in error) {
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;
      const serverMessage =
        axiosError.response?.data?.message || axiosError.response?.data?.error;

      if (serverMessage) return serverMessage;
      if (axiosError.code === "ERR_NETWORK") return "Lỗi kết nối mạng";
    }
    return "Có lỗi xảy ra, vui lòng thử lại!";
  },
};
