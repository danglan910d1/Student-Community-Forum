"use client";

import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarLayoutWrapperProps {
  sidebar: ReactNode;
  children: ReactNode;
  sidebarClassName?: string;
  // Thêm prop này để tùy chỉnh vị trí dính
  stickyClassName?: string;
}

export const SidebarLayoutWrapper = ({
  sidebar,
  children,
  sidebarClassName,
  stickyClassName = "top-14 h-[calc(100vh-3.5rem)]",
}: SidebarLayoutWrapperProps) => {
  return (
    // Quan trọng: Phải có overflow-visible để sticky hoạt động
    <SidebarProvider className="flex-1 items-start overflow-visible">
      <div className="mx-auto flex w-full max-w-[1800px] flex-1 items-start">
        <aside
          className={cn(
            "sticky hidden md:block",
            stickyClassName, // Sử dụng class động ở đây
            sidebarClassName
          )}
        >
          {sidebar}
        </aside>

        <SidebarInset className="flex-1 overflow-visible">
          <main className="p-4 md:p-6 min-h-full">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
