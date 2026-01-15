// src/components/layout/MainContainer.tsx

import { AppSidebar } from "./AppSidebar";
import { SidebarLayoutWrapper } from "./SideBarWrapper";

export const MainContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarLayoutWrapper sidebar={<AppSidebar />}>
      {children}
    </SidebarLayoutWrapper>
  );
};
