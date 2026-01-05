"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import FullPageSkeleton from "@/components/loading/FullPageSkeleton ";

let hasLoadedOnce = false;

export function InitialLoadProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  // Khởi tạo mounted = false để khớp với Server Side
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(!hasLoadedOnce && !isAuthPage);

  useEffect(() => {
    // Sử dụng useEffect để đánh dấu đã vào môi trường Client
    const mountTimer = setTimeout(() => {
      setMounted(true);
    }, 0);

    // Xử lý loading cho lần đầu vào ứng dụng
    if (!hasLoadedOnce && !isAuthPage) {
      const loadTimer = setTimeout(() => {
        setLoading(false);
        hasLoadedOnce = true;
      }, 500);
      return () => {
        clearTimeout(mountTimer);
        clearTimeout(loadTimer);
      };
    }

    return () => clearTimeout(mountTimer);
  }, [isAuthPage]);

  // Giải quyết lỗi QueryClient: Khi chưa mounted, không render con mà dùng hook query
  // Điều này đảm bảo useMutation chỉ chạy trên Client sau khi Provider đã sẵn sàng
  if (!mounted) {
    return null;
  }

  // Nếu là trang auth, render con ngay lập tức không qua loading
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Loading full màn hình cho lần đầu vào app
  if (loading) {
    return <FullPageSkeleton />;
  }

  return <>{children}</>;
}
