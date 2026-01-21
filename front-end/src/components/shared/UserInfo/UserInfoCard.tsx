"use client";

import { Settings } from "lucide-react";
import { CardLayout } from "@/components/layout/CardLayout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIdentity } from "@/components/shared/UserIdentity";
import { UserMenuContent } from "./UserMenuContent";

export const UserInfoCard = () => {
  const { user, logout } = useAuthStore();
  if (!user) return null;

  return (
    <CardLayout className="shadow-md border-primary/10 dark:border-warning/10 p-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <UserIdentity
            user={user}
            size="md"
            shape="circle"
            showOnlineStatus={true}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 group shrink-0"
            >
              <Settings
                size={18}
                className="text-muted-foreground group-hover:text-primary group-hover:rotate-90 transition-all duration-500"
              />
            </Button>
          </DropdownMenuTrigger>
          <UserMenuContent userId={user.userId} logout={logout} />
        </DropdownMenu>
      </div>
    </CardLayout>
  );
};
