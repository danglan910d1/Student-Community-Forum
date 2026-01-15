"use client";

import * as React from "react";
import { Sidebar, SidebarGroup } from "@/components/ui/sidebar";
import { QuickNavigation } from "@/components/shared/Navigation/QuickNavigation/QuickNavigation";
import { UserInfo } from "@/components/shared/UserInfo";
import { PopularTags } from "@/modules/tag/components/PopularTag";
import { BaseSidebar } from "./BaseSidebar";

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      // Ép shadcn không tự xử lý thu gọn để SidebarLayoutWrapper bên trên tự quản lý width 0
      collapsible="none"
      className={className}
      {...props}
    >
      <BaseSidebar footer={<UserInfo />}>
        <SidebarGroup className="p-0">
          <QuickNavigation />
        </SidebarGroup>

        <SidebarGroup className="p-0 flex-1 overflow-hidden">
          <PopularTags />
        </SidebarGroup>
      </BaseSidebar>
    </Sidebar>
  );
}
