"use client";

import { VariantProps, cva } from "class-variance-authority";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getAssetUrl } from "@/lib/utils";
import { getInitials } from "@/utils/string";
import Link from "next/link";

const avatarVariants = cva(
  "shrink-0 border border-border overflow-hidden transition-all",
  {
    variants: {
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-24 w-24 md:h-28 md:w-28",
        xl: "h-32 w-32",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-lg",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
    },
  },
);

export interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  user?: { userId?: string; name?: string; avatar?: string };
  className?: string;
  disableLink?: boolean; // Thêm prop này để kiểm soát việc bọc Link
}

export function UserAvatar({
  user,
  size,
  shape,
  className,
  disableLink = false, // Mặc định là vẫn có Link nếu có userId
}: UserAvatarProps) {
  const content = (
    <Avatar
      className={cn(
        avatarVariants({ size, shape }),
        // Chỉ thêm hiệu ứng hover/cursor nếu có link hoặc không bị disable
        user?.userId &&
          !disableLink &&
          "cursor-pointer hover:opacity-80 active:scale-95",
        className,
      )}
    >
      <AvatarImage
        src={getAssetUrl(user?.avatar)}
        alt={user?.name}
        className="object-cover"
      />
      <AvatarFallback
        className={cn(
          "bg-muted font-bold text-muted-foreground uppercase flex items-center justify-center",
          size === "lg" || size === "xl" ? "text-2xl" : "text-[10px]",
        )}
      >
        {getInitials(user?.name || "U")}
      </AvatarFallback>
    </Avatar>
  );

  // Nếu bị disable link hoặc không có userId, trả về nội dung avatar thuần
  if (disableLink || !user?.userId) {
    return content;
  }

  // Ngược lại thì bọc trong Link như cũ
  return <Link href={`/profile/${user.userId}`}>{content}</Link>;
}
