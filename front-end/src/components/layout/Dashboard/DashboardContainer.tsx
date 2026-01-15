import { SidebarLayoutWrapper } from "../SideBarWrapper";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SidebarLayoutWrapper sidebar={<DashboardSidebar />}>
      {" "}
      <div>{children}</div>
    </SidebarLayoutWrapper>
  );
};
