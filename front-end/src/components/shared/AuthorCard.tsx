"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { UserAvatar } from "@/components/shared/UserAvatar"; // Sử dụng Shared Component

interface AuthorCardProps {
  user: {
    userId: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  createdAt: string;
  label?: string;
}

export function AuthorCard({
  user,
  createdAt,
  label = "Đã hỏi lúc",
}: AuthorCardProps) {
  return (
    /* Sử dụng bg-muted/30 và border-border để đồng bộ toàn hệ thống */
    <div className="bg-muted/30 p-4 rounded-xl border border-border w-full max-w-[260px] shadow-sm">
      {/* TIME LABEL: Giữ nguyên style nhỏ gọn */}
      <p className="text-[11px] mb-3 text-muted-foreground font-medium uppercase tracking-tight">
        {label}{" "}
        {format(new Date(createdAt), "HH:mm, 'ngày' dd/MM", { locale: vi })}
      </p>

      {/* AUTHOR AREA */}
      <div className="flex items-center gap-3">
        {/* Avatar: Không có hiệu ứng hover, giữ sự tĩnh lặng thanh lịch */}
        <UserAvatar
          user={user}
          size="md"
          shape="square" // Bạn có thể đổi thành 'circle' tùy ý
          className="border-border/50"
        />

        <div className="flex-1 min-w-0">
          {/* Tên tác giả: Chỉ hover ở đây mới gạch chân */}
          <Link
            href={`/profile/${user.userId}`}
            className="text-foreground font-bold hover:underline decoration-1 underline-offset-2 leading-tight text-[15px] truncate block"
          >
            {user.name}
          </Link>

          {/* Role: Style italic thanh mảnh như bản gốc */}
          <p className="text-xs text-muted-foreground truncate italic mt-1 opacity-80">
            {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
          </p>
        </div>
      </div>
    </div>
  );
}
