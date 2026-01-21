"use client";
import { ReactNode, useState } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PanelLeft, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarLayoutWrapperProps {
  sidebar: ReactNode;
  children: ReactNode;
  isRoot?: boolean;
  isAboutPage?: boolean;
}

export const SidebarLayoutWrapper = ({
  sidebar,
  children,
  isRoot = false,
  isAboutPage = false,
}: SidebarLayoutWrapperProps) => {
  const isMobile = useIsMobile();
  const [internalOpenMobile, setInternalOpenMobile] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-1 items-stretch min-h-[calc(100vh-3.5rem)] w-full relative",
        !isRoot && "mx-auto max-w-[1800px]",
      )}
    >
      {/* SIDEBAR DESKTOP - Style Đóng từ Code Trên */}
      <aside
        className={cn(
          "sticky top-14 self-start border-r bg-background h-[calc(100vh-3.5rem)] z-20 transition-all duration-300 ease-in-out",
          !isAboutPage && isDesktopCollapsed
            ? "w-0 border-none opacity-0 invisible" // Style đóng êm ái
            : "w-[var(--sidebar-width)] opacity-100 visible",
          isAboutPage ? "hidden" : "hidden lg:block",
        )}
      >
        <div className="h-full w-[var(--sidebar-width)] relative group">
          {/* Nút thu gọn lơ lửng mép phải */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-3 h-6 w-6 rounded-full border bg-background shadow-sm z-30 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsDesktopCollapsed(true)}
            title="Thu gọn menu"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="h-full w-full">{sidebar}</div>
        </div>
      </aside>

      <SidebarInset className="flex-1 min-w-0 bg-background flex flex-col relative">
        {/* NÚT MỞ LẠI - Style Mở từ Code Dưới */}
        {!isAboutPage && !isMobile && isDesktopCollapsed && (
          <div className="absolute left-0 top-0 z-40 flex items-center p-4 animate-in fade-in slide-in-from-left-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={() => setIsDesktopCollapsed(false)}
            >
              <PanelLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
            {/* <span className="ml-2 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
              Hiện Menu
            </span> */}
          </div>
        )}

        {/* SIDEBAR MOBILE PHỤ TRỢ (ABOUT) */}
        {isAboutPage && isMobile && (
          <div className="hidden" aria-hidden="true">
            {sidebar}
          </div>
        )}

        {/* SIDEBAR MOBILE NỘI BỘ */}
        {isMobile && !isRoot && (
          <Sheet open={internalOpenMobile} onOpenChange={setInternalOpenMobile}>
            <SheetContent side="left" className="p-0 w-[280px] z-[110]">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu nội bộ</SheetTitle>
              </SheetHeader>
              <div
                className="h-full w-full pt-4"
                onClick={() => setInternalOpenMobile(false)}
              >
                {sidebar}
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Header phụ Mobile */}
        {!isRoot && isMobile && (
          <header className="sticky top-14 z-30 flex h-10 shrink-0 items-center border-b bg-background/95 px-4 backdrop-blur">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mr-2"
              onClick={() => setInternalOpenMobile(true)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
              Menu nội bộ
            </span>
          </header>
        )}

        <main
          className={cn(
            "min-w-0 w-full flex-1 flex flex-col transition-all duration-300",
            isRoot ? "" : "p-4 md:p-6",
            // Padding top cho nội dung khi nút Mở hiện ra thay thế header
            !isMobile && isDesktopCollapsed && "pt-12",
          )}
        >
          {children}
        </main>
      </SidebarInset>
    </div>
  );
};
