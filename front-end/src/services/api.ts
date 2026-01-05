// src/services/api.ts
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
// Đường dẫn đến store Zustand của bạn

// Khởi tạo instance Axios
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR: Xử lý trước khi gửi yêu cầu lên Server
api.interceptors.request.use(
  (config) => {
    // 1. Tự động gắn Token từ Zustand Store
    // Sử dụng getState() để lấy dữ liệu hiện tại mà không cần dùng Hook
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Tự động gắn x-request-id cho các phương thức thay đổi dữ liệu
    // Giúp Backend chặn các yêu cầu trùng lặp (Idempotency)
    const idempotentMethods = ["post", "put", "delete", "patch"];
    if (idempotentMethods.includes(config.method?.toLowerCase() || "")) {
      // Sử dụng API có sẵn của trình duyệt hiện đại để tạo UUID
      // Nếu hỗ trợ môi trường cũ hơn có thể dùng thư viện 'uuid'
      config.headers["x-request-id"] = self.crypto.randomUUID();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Xử lý kết quả trả về từ Server
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi tập trung (ví dụ: Token hết hạn - 401)
    if (error.response?.status === 401) {
      console.error("Phiên đăng nhập hết hạn.");
      // Bạn có thể gọi useAuthStore.getState().logout() ở đây
    }
    return Promise.reject(error);
  }
);
