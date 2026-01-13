// app/(main)/dashboard/_components/DashboardSidebar.tsx
import { BaseSidebar } from "@/components/layout/BaseSidebar"; // Import component dùng chung
import { SidebarGroup } from "@/components/ui/sidebar";
import { QuickNavItem } from "@/components/shared/Navigation/QuickNavigation/QuickNavItem";
import { DASHBOARD_NAV_ITEMS } from "@/constants/navigation";
import { CardLayout } from "../CardLayout";

export function DashboardSidebar() {
  return (
    <BaseSidebar collapsible="none">
      <SidebarGroup className="p-0 ">
        <CardLayout className="shadow-sm border-none">
          <div className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase bg-muted/30">
            Bảng điều khiển
          </div>
          {DASHBOARD_NAV_ITEMS.map((item, index) => (
            <QuickNavItem key={item.label} item={item} showBorder={index > 0} />
          ))}
        </CardLayout>
      </SidebarGroup>
    </BaseSidebar>
  );
}
