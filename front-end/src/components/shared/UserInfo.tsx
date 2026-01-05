"use client";
import { Settings } from "lucide-react";
import { CardLayout } from "@/components/layout/CardLayout";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore";

export const UserInfo = () => {
  // 1. Lấy dữ liệu từ Zustand Store
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 2. Logic tạo chữ cái đầu cho Avatar Fallback (ví dụ: "Đặng Lân" -> "ĐL")
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  // Nếu chưa đăng nhập thì có thể ẩn UserInfo hoặc hiện nút Login
  if (!isAuthenticated || !user) return null;

  return (
    <CardLayout className="shadow-md">
      <div className="flex items-center gap-4">
        {/* AVATAR WRAPPER: Nơi chứa ảnh và chấm xanh online */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-12 h-12 border border-gray-100">
            {/* Sử dụng avatar từ DB, nếu là chuỗi rỗng "" hoặc null, AvatarImage sẽ tự lỗi và hiện Fallback */}
            <AvatarImage
              src={user.avatar}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-100 dark:bg-primary text-foreground font-bold text-md">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* CHẤM XANH ĐÈ LÊN: absolute định vị so với relative wrapper */}
          <div
            className={cn(
              "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white",
              "bg-green-500"
            )}
            title="Trực tuyến"
          />
        </div>

        {/* THÔNG TIN TEXT */}
        <div className="flex-1 min-w-0">
          <p className="text-foreground font-bold truncate leading-tight text-md">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground truncate italic mt-1">
            {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
          </p>
        </div>

        {/* NÚT SETTINGS (Sẽ làm xoay ở bước sau) */}
        <div className="group cursor-pointer p-1.5 hover:bg-gray-100 rounded-md transition-colors">
          <Settings
            size={18}
            className="text-gray-400 group-hover:text-blue-700 transition-transform duration-300"
          />
        </div>
      </div>
    </CardLayout>
  );
};
