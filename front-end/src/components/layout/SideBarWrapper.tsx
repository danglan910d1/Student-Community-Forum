"use client";

import { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarLayoutWrapperProps {
  sidebar: ReactNode;
  children: ReactNode;
  sidebarClassName?: string;
  stickyClassName?: string;
}

// 1. Định nghĩa interface riêng cho Component phụ hoặc Pick các field cần thiết
interface SidebarContentWrapperProps {
  sidebar: ReactNode;
  sidebarClassName?: string;
  stickyClassName?: string;
}

const SidebarContentWrapper = ({
  sidebar,
  sidebarClassName,
  stickyClassName,
}: SidebarContentWrapperProps) => {
  const { open } = useSidebar();

  return (
    <aside
      className={cn(
        "sticky hidden md:block transition-all duration-300 ease-in-out z-20",
        stickyClassName,
        // LOGIC: Biến mất hoàn toàn khi open = false
        open
          ? "w-[var(--sidebar-width)] opacity-100"
          : "w-0 opacity-0 overflow-hidden",
        "h-[calc(100vh-3.5rem)]",
        sidebarClassName
      )}
    >
      <div className="h-full w-full">{sidebar}</div>
    </aside>
  );
};

export const SidebarLayoutWrapper = ({
  sidebar,
  children,
  sidebarClassName,
  stickyClassName = "top-14",
}: SidebarLayoutWrapperProps) => {
  return (
    <SidebarProvider className="flex-1 items-start overflow-visible">
      <div className="mx-auto flex w-full max-w-[1800px] flex-1 items-start min-w-0">
        {/* Bây giờ gọi ở đây sẽ không còn lỗi Type nữa */}
        <SidebarContentWrapper
          sidebar={sidebar}
          sidebarClassName={sidebarClassName}
          stickyClassName={stickyClassName}
        />

        <SidebarInset className="flex-1 min-w-0 bg-background overflow-visible transition-all duration-300">
          <header className="flex h-12 shrink-0 items-center gap-2 px-4 md:px-6 sticky top-0 bg-background/95 backdrop-blur z-30 border-b">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>

          <main className="p-4 md:p-6 min-w-0 w-full flex flex-col">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
