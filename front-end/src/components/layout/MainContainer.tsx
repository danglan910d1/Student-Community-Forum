"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { SidebarLayoutWrapper } from "./SideBarWrapper";

export const MainContainer = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAboutPage = pathname === "/about";

  // Luôn dùng Wrapper để Mobile có Sidebar, nhưng ẩn sidebar desktop nếu là trang about
  return (
    <SidebarLayoutWrapper
      sidebar={<AppSidebar />}
      isRoot={true}
      isAboutPage={isAboutPage}
    >
      {children}
    </SidebarLayoutWrapper>
  );
};
