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

const SidebarContentWrapper = ({
  sidebar,
  sidebarClassName,
  stickyClassName,
}: {
  sidebar: ReactNode;
  sidebarClassName?: string;
  stickyClassName?: string;
}) => {
  const { open } = useSidebar();

  return (
    <aside
      className={cn(
        // top-14 để khớp với chiều cao header bên ngoài
        "sticky top-14 self-start hidden md:block transition-all duration-300 ease-in-out z-20",
        stickyClassName,
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
    // SỬA: Thêm min-h và w-full trực tiếp vào SidebarProvider
    <SidebarProvider className="flex-1 w-full items-start overflow-visible min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto flex w-full max-w-[1800px] flex-1 items-stretch min-h-inherit">
        <SidebarContentWrapper
          sidebar={sidebar}
          sidebarClassName={sidebarClassName}
          stickyClassName={stickyClassName}
        />

        <SidebarInset className="flex-1 min-w-0 bg-background overflow-visible transition-all duration-300 flex flex-col border-l">
          {/* SỬA: top-14 để header này dính ngay dưới header chính, không bị trượt lên top-0 gây hụt nội dung */}
          <header className="flex h-12 shrink-0 items-center gap-2 px-4 md:px-6 sticky top-14 bg-background/95 backdrop-blur z-30 border-b">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>

          {/* flex-1 ở đây đảm bảo vùng trắng (bg-background) giãn xuống hết SidebarInset */}
          <main className="p-4 md:p-6 min-w-0 w-full flex-1 flex flex-col bg-background">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
