"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { QuickNavigation } from "../shared/QuickNavigation";
import { PopularTags } from "../../modules/posts/components/shared/PopularTag";
import { UserInfo } from "../shared/UserInfo";
import { cn } from "@/lib/utils";

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      variant="sidebar"
      className={cn("border-r bg-background", className)}
      {...props}
    >
      <SidebarContent className="gap-4 p-2 custom-scrollbar">
        {/* 2. Nhóm điều hướng nhanh */}
        <SidebarGroup className="p-0">
          <QuickNavigation />
        </SidebarGroup>

        {/* 3. Popular Tags - flex-1 để chiếm diện tích còn lại và tự scroll */}
        <SidebarGroup className="p-0 flex-1 overflow-hidden">
          <PopularTags />
        </SidebarGroup>
      </SidebarContent>

      {/* 4. User Info - Luôn nằm cố định ở dưới cùng */}
      <SidebarFooter className="border-t bg-background">
        <UserInfo />
      </SidebarFooter>
    </Sidebar>
  );
}
