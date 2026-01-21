"use client";

import { LogOut, User, LayoutDashboard, Globe } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface UserMenuContentProps {
  userId?: string;
  logout: () => void;
}

export const UserMenuContent = ({ userId, logout }: UserMenuContentProps) => {
  return (
    <DropdownMenuContent
      align="end"
      className="w-56 mt-2 shadow-lg"
      sideOffset={8}
    >
      <DropdownMenuLabel className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
        Tài khoản của tôi
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        {/* Lựa chọn 1: Vào Dashboard (Quản trị nội bộ) */}
        {/* Đổi tên thành Bảng quản trị để rõ nghĩa hơn là khu vực cá nhân */}
        <Link href="/dashboard/profile">
          <DropdownMenuItem className="cursor-pointer focus:bg-primary/5">
            <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Quản lý hồ sơ</span>
          </DropdownMenuItem>
        </Link>

        {/* Lựa chọn 2: Xem trang cá nhân công khai */}
        {userId && (
          <Link href={`/profile/${userId}`}>
            <DropdownMenuItem className="cursor-pointer focus:bg-primary/5">
              <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Xem trang công khai</span>
            </DropdownMenuItem>
          </Link>
        )}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      {/* Lựa chọn 3: Đăng xuất - Giữ nguyên style text-destructive */}
      <DropdownMenuItem
        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
        onClick={() => logout()}
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>Đăng xuất</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};
