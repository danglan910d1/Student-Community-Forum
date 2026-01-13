import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface BaseSidebarProps extends React.ComponentProps<typeof Sidebar> {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function BaseSidebar({
  children,
  footer,
  className,
  ...props
}: BaseSidebarProps) {
  return (
    <Sidebar
      collapsible="none"
      variant="sidebar"
      className={cn("border-r bg-background", className)}
      {...props}
    >
      <SidebarContent className="gap-4 p-2 custom-scrollbar">
        {children}
      </SidebarContent>
      {footer && (
        <SidebarFooter className="border-t bg-background">
          {footer}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
