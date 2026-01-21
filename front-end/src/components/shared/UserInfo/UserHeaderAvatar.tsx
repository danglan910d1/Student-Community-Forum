"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "../UserAvatar"; // Đường dẫn tương ứng cấu trúc folder của bạn
import { useAuthStore } from "@/stores/useAuthStore";
import { UserMenuContent } from "./UserMenuContent";

export const UserHeaderAvatar = () => {
  const { user, logout } = useAuthStore();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-primary/20"
        >
          <UserAvatar user={user} size="sm" />
        </Button>
      </DropdownMenuTrigger>
      <UserMenuContent userId={user.userId} logout={logout} />
    </DropdownMenu>
  );
};
