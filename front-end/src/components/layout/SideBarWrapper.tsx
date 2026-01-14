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
    <SidebarProvider className="flex-1 items-start overflow-visible">
      {/* Thêm min-w-0 vào đây */}
      <div className="mx-auto flex w-full max-w-[1800px] flex-1 items-start min-w-0">
        <aside
          className={cn(
            "sticky hidden md:block",
            stickyClassName,
            sidebarClassName
          )}
        >
          {sidebar}
        </aside>

        {/* Thêm min-w-0 vào SidebarInset và main */}
        <SidebarInset className="flex-1 overflow-visible min-w-0">
          <main className="p-4 md:p-6 min-h-full min-w-0 w-full flex flex-col">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
