"use client";

import * as React from "react";
import { Sidebar, SidebarGroup, useSidebar } from "@/components/ui/sidebar";
import { QuickNavigation } from "@/components/shared/Navigation/QuickNavigation/QuickNavigation";
import { PopularTags } from "@/modules/tag/components/PopularTag";
import { BaseSidebar } from "./BaseSidebar";
import { UserInfoCard } from "../shared/UserInfo/UserInfoCard";
import { Logo } from "@/components/shared/Logo";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  const handleItemClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) {
      setOpenMobile(false);
    }
  };

  return (
    /* GIẢI PHÁP: 
      - collapsible: Nếu là mobile thì dùng "icon" (để mở được Sheet). 
        Nếu là desktop thì dùng "none" (để hiện tĩnh như ban đầu).
    */
    <BaseSidebar
      {...props}
      collapsible={isMobile ? "icon" : "none"}
      className={className}
      header={
        <div className="lg:hidden flex justify-start py-2 px-4">
          <Logo />
        </div>
      }
      footer={
        <div className="hidden lg:block">
          <UserInfoCard />
        </div>
      }
    >
      <div
        onClick={handleItemClick}
        className="flex flex-col flex-1 h-full gap-2"
      >
        <SidebarGroup className="p-0">
          <QuickNavigation />
        </SidebarGroup>

        <SidebarGroup className="p-0 flex-1 overflow-hidden">
          <PopularTags />
        </SidebarGroup>
      </div>
    </BaseSidebar>
  );
}
