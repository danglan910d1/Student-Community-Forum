import { useAuthStore } from "@/stores/useAuthStore";
import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const idempotentMethods = ["post", "put", "delete", "patch"];
    if (idempotentMethods.includes(config.method?.toLowerCase() || "")) {
      config.headers["x-request-id"] = self.crypto.randomUUID();
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data) {
      const stringified = JSON.stringify(response.data);
      if (stringified.includes("localhost:3000")) {
        // Sửa lỗi port 3000 sang 5000 cho toàn bộ dữ liệu trả về từ API
        response.data = JSON.parse(
          stringified.replace(
            /http:\/\/localhost:3000/g,
            "http://localhost:5000"
          )
        );
      }
    }
    console.log("Dữ liệu sau khi Interceptor xử lý:", response.data);
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
