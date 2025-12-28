import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface MainContainerProps {
  children: ReactNode;
}

export const MainContainer = ({ children }: MainContainerProps) => {
  return (
    <SidebarProvider className="flex-1 items-start min-h-0">
      <div className="mx-auto flex w-full max-w-[1800px] flex-1">
        {/* Sidebar chuẩn Shadcn, sticky bên trong container */}
        <AppSidebar className="sticky top-14 h-[calc(100vh-3.5rem)] border-r" />

        {/* SidebarInset chứa nội dung chính */}
        <SidebarInset className="flex-1 overflow-visible">
          <main className="p-4 md:p-6 min-h-full">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
