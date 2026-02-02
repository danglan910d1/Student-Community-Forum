"use client";

import Link from "next/link";
import { HelpCircle, Bell, Menu, Info } from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { SearchBar } from "@/components/shared/SearchBar";
import { TopicDropdownContainer } from "@/modules/topic/containers/TopicDropdownContainer";
import { NotificationDropdown } from "@/modules/noti/components/NotiDropdown";

import { useAuthStore } from "@/stores/useAuthStore";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserHeaderAvatar } from "../shared/UserInfo/UserHeaderAvatar";

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const { setOpenMobile } = useSidebar();

  return (
    <header className="bg-header-footer sticky top-0 z-50 w-full border-b-2 border-primary dark:border-warning shadow-md h-14">
      {/* Container chính: Desktop dùng grid 9 cột như cũ (2-7), Mobile dùng flex để tối ưu không gian */}
      <div className="mx-auto h-full max-w-[1800px] px-2 md:px-4 flex lg:grid lg:grid-cols-9 items-center gap-2 md:gap-4">
        {/* CỘT LOGO: 2 cột trên LG. Trên Mobile hiện nút Menu */}
        <div className="lg:col-span-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10 shrink-0"
            onClick={() => setOpenMobile(true)}
          >
            <Menu className="h-6 w-6" strokeWidth={2.5} />
          </Button>
          <div className="hidden sm:block">
            <Logo />
          </div>
        </div>

        {/* CỘT CHÍNH: 7 cột trên LG. Chứa Topic + Search + Actions */}
        <div className="flex-1 lg:col-span-7 flex items-center space-x-2 md:space-x-4">
          {/* Topic Dropdown: Ẩn trên mobile cực nhỏ */}
          <div className="flex-shrink-0">
            <TopicDropdownContainer />
          </div>

          {/* Search Bar: Chiếm trọn không gian còn lại */}
          <div className="flex-1 min-w-0">
            <SearchBar className="w-full" />
          </div>

          {/* Cụm Actions */}
          <div className="flex items-center space-x-1 md:space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-1 md:space-x-3 text-gray-500">
                {/* Help: Style giữ nguyên xi */}
                <Button
                  variant="ghost"
                  size="icon-lg"
                  asChild
                  title="Về chúng tôi"
                >
                  <Link href="/about">
                    {/* Tăng size icon lên 20 (w-5 h-5) */}
                    <Info />
                  </Link>
                </Button>

                {/* Nút Trợ giúp (HelpCircle) - Đã đồng bộ h-10 w-10 */}
                <Button variant="ghost" size="icon-lg" title="Trợ giúp">
                  {/* Tăng size icon lên h-5 w-5 để khớp với Info */}
                  <HelpCircle />
                </Button>

                {/* Notification: Dùng bản Module NotiDropdown đã có */}
                <NotificationDropdown />

                {/* User Avatar Dropdown: CHỈ HIỆN KHI KHÔNG PHẢI DESKTOP */}
                <div className="lg:hidden flex items-center">
                  <UserHeaderAvatar />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end">
                {/* Nút Đăng nhập: Luôn hiển thị */}
                <Button variant="ghost" size="sm" asChild className="flex">
                  <Link href="/auth/login">Đăng nhập</Link>
                </Button>

                {/* Nút Đăng ký: Ẩn trên mobile (dưới 640px), hiện từ 'sm' trở lên */}
                <Button
                  size="sm"
                  asChild
                  className="hidden sm:flex bg-primary hover:bg-primary/90 text-white font-bold h-9 px-4 ml-2"
                >
                  <Link href="/auth/register">Đăng ký</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
