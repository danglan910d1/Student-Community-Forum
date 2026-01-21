"use client";
import * as React from "react";
import { X } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BaseSidebarProps extends React.ComponentProps<typeof Sidebar> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function BaseSidebar({
  children,
  header,
  footer,
  className,
  collapsible = "none",
  ...props
}: BaseSidebarProps) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar
      collapsible={collapsible}
      variant="sidebar"
      className={cn("border-r bg-background h-full", className)}
      {...props}
    >
      {/* HEADER SECTION */}
      {header && (
        <div className="border-b shrink-0 flex items-center justify-between pr-2">
          {/* Render Logo hoặc nội dung header truyền vào */}
          <div className="flex-1">{header}</div>

          {/* NÚT ĐÓNG: Chỉ hiện trên Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden"
            onClick={() => setOpenMobile(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Trường hợp không có header truyền vào nhưng vẫn cần nút đóng trên Mobile */}
      {!header && (
        <div className="flex justify-end p-2 lg:hidden border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenMobile(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      <SidebarContent className="gap-4 p-2 custom-scrollbar flex-1">
        {children}
      </SidebarContent>

      {footer && (
        <SidebarFooter className="border-t bg-background shrink-0">
          {footer}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
