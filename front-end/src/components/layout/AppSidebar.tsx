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
    <BaseSidebar className={className} footer={<UserInfo />} {...props}>
      {/* 1. Nhóm điều hướng nhanh */}
      <SidebarGroup className="p-0">
        <QuickNavigation />
      </SidebarGroup>

      {/* 2. Popular Tags - Chiếm diện tích còn lại */}
      <SidebarGroup className="p-0 flex-1 overflow-hidden">
        <PopularTags />
      </SidebarGroup>
    </BaseSidebar>
  );
}
