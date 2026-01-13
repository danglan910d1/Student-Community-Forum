import { CardLayout } from "../CardLayout";
import { SidebarLayoutWrapper } from "../SideBarWrapper";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SidebarLayoutWrapper
      sidebar={<DashboardSidebar />}
      sidebarClassName="w-64"
      stickyClassName="sticky top-2 h-[calc(100vh)]"
    >
      {" "}
      <div>{children}</div>
    </SidebarLayoutWrapper>
  );
};
