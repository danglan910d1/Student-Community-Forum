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
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarLayoutWrapperProps {
  sidebar: ReactNode;
  children: ReactNode;
  isRoot?: boolean;
  isAboutPage?: boolean; // Prop mới bổ sung
}

export const SidebarLayoutWrapper = ({
  sidebar,
  children,
  isRoot = false,
  isAboutPage = false, // Mặc định là false
}: SidebarLayoutWrapperProps) => {
  const isMobile = useIsMobile();
  const [internalOpenMobile, setInternalOpenMobile] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-1 items-stretch min-h-[calc(100vh-3.5rem)] w-full",
        !isRoot && "mx-auto max-w-[1800px]",
      )}
    >
      {/* SIDEBAR DESKTOP: Giữ nguyên logic, chỉ ẩn đi bằng CSS nếu là trang About */}
      <aside
        className={cn(
          "sticky top-14 self-start border-r bg-background h-[calc(100vh-3.5rem)] z-20",
          "w-[var(--sidebar-width)]",
          // LOGIC: Nếu là About thì ẩn hẳn, nếu không thì dùng hidden lg:block như cũ
          isAboutPage ? "hidden" : "hidden lg:block",
        )}
      >
        <div className="h-full w-full">{sidebar}</div>
      </aside>

      {/* SIDEBAR MOBILE PHỤ TRỢ CHO TRANG ABOUT:
          Cần render sidebar ẩn trong DOM để SidebarProvider trên Header tìm thấy 
      */}
      {isAboutPage && isMobile && (
        <div className="hidden" aria-hidden="true">
          {sidebar}
        </div>
      )}

      {/* SIDEBAR MOBILE NỘI BỘ (GIỮ NGUYÊN GỐC CỦA BẠN) */}
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

      <SidebarInset className="flex-1 min-w-0 bg-background flex flex-col">
        {/* Header phụ (GIỮ NGUYÊN GỐC CỦA BẠN) */}
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
            "min-w-0 w-full flex-1 flex flex-col",
            isRoot ? "" : "p-4 md:p-6",
          )}
        >
          {children}
        </main>
      </SidebarInset>
    </div>
  );
};
