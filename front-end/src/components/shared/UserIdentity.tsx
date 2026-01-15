"use client";

import Link from "next/link";
import { UserAvatar, UserAvatarProps } from "./UserAvatar";
import { cn } from "@/lib/utils";

interface UserIdentityProps {
  user: {
    userId: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  subText?: string;
  size?: UserAvatarProps["size"];
  shape?: UserAvatarProps["shape"];
  className?: string;
  showOnlineStatus?: boolean; // Thêm prop này
}

export function UserIdentity({
  user,
  subText,
  size = "sm",
  shape = "circle",
  className,
  showOnlineStatus = false,
}: UserIdentityProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* AVATAR + ONLINE STATUS */}
      <div className="relative shrink-0">
        <UserAvatar user={user} size={size} shape={shape} />
        {showOnlineStatus && (
          <div
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-2 border-white bg-green-500",
              size === "md" ? "w-3.5 h-3.5" : "w-2.5 h-2.5"
            )}
          />
        )}
      </div>

      {/* TEXT CONTENT */}
      <div className="flex flex-col min-w-0">
        <Link
          href={`/profile/${user.userId}`}
          className={cn(
            "text-foreground font-bold leading-tight truncate hover:underline decoration-1 underline-offset-2",
            size === "xs" && "text-[12px]",
            size === "sm" && "text-[14px]",
            size === "md" && "text-[16px]",
            size === "lg" && "text-[20px] md:text-[24px]"
          )}
        >
          {user.name}
        </Link>

        <p
          className={cn(
            "text-muted-foreground truncate italic mt-0.5 opacity-80",
            size === "lg" ? "text-sm" : "text-[11px]"
          )}
        >
          {subText || (user.role === "admin" ? "Quản trị viên" : "Thành viên")}
        </p>
      </div>
    </div>
  );
}
