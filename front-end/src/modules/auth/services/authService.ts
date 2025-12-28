import { api } from "@/services/api";
import { AuthResponse, LoginRequest, SignupRequest } from "../types";

export const authService = {
  register: async (payload: SignupRequest): Promise<AuthResponse> => {
    // Lưu ý: .post<AuthResponse> giúp định nghĩa kiểu dữ liệu trả về của axios
    const response = await api.post<AuthResponse>("/auth/register", payload);
    return response.data;
  },
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", payload);
    return response.data;
  },
};
