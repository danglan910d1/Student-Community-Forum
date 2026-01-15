"use client";

import { LogOut, User, Settings } from "lucide-react";
import { CardLayout } from "@/components/layout/CardLayout";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIdentity } from "@/components/shared/UserIdentity";

export const UserInfo = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  if (!isAuthenticated || !user) return null;

  return (
    <CardLayout className="shadow-md">
      <div className="flex items-center">
        {/* THÊM flex-1 VÀO ĐÂY ĐỂ ĐẨY NÚT SETTINGS SANG PHẢI */}
        <UserIdentity
          user={user}
          size="md"
          shape="circle"
          showOnlineStatus={true}
          className="flex-1 max-w-[85%]"
        />

        {/* NÚT SETTINGS */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group cursor-pointer p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors outline-none shrink-0 border-none bg-transparent">
              <Settings
                size={18}
                className="text-gray-400 group-hover:text-blue-700 group-hover:rotate-90 transition-all duration-300"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 mt-2">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/dashboard/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ cá nhân</span>
                </DropdownMenuItem>
              </Link>
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
