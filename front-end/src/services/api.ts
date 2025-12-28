// src/services/api.ts

import axios from "axios";

// Khởi tạo instance Axios
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Lấy từ .env.local
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("API Base URL hiện tại là:", process.env.NEXT_PUBLIC_API_URL);

// Bạn sẽ thêm các Interceptor (xử lý Token JWT, Refresh Token) ở đây sau.
