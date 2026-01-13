"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function AuthCacheWatcher() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Chỉ clear khi trạng thái thực sự thay đổi (đăng nhập hoặc đăng xuất)
    // Điều này đảm bảo dữ liệu cũ của Guest không bị lẫn vào User và ngược lại
    queryClient.clear();
  }, [isAuthenticated, queryClient]);

  return null;
}
