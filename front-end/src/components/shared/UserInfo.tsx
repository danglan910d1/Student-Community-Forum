"use client";

import { LogOut, Settings, User } from "lucide-react";
import { CardLayout } from "@/components/layout/CardLayout";
import { cn, getAssetUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserInfo = () => {
  // 1. Lấy dữ liệu và hàm logout từ Zustand Store
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  // 2. Logic tạo chữ cái đầu cho Avatar Fallback
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  // Nếu chưa đăng nhập thì ẩn component
  if (!isAuthenticated || !user) return null;

  return (
    <CardLayout className="shadow-md">
      <div className="flex items-center gap-4">
        {/* AVATAR WRAPPER */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-12 h-12 border border-gray-100">
            <AvatarImage
              src={getAssetUrl(user.avatar)}
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-100 dark:bg-primary text-foreground font-bold text-md">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* CHẤM XANH ONLINE */}
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

        {/* DROPDOWN MENU SETTINGS */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="group cursor-pointer p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors outline-none">
              <Settings
                size={18}
                className="text-gray-400 group-hover:text-blue-700 group-hover:rotate-90 transition-all duration-300"
              />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt hệ thống</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardLayout>
  );
};
