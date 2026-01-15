// app/(main)/profile/_components/ProfileSidebar.tsx
import { BaseSidebar } from "@/components/layout/BaseSidebar";
import { SidebarGroup } from "@/components/ui/sidebar";
import { QuickNavItem } from "@/components/shared/Navigation/QuickNavigation/QuickNavItem";
import { PUBLIC_PROFILE_NAV_ITEMS } from "@/constants/navigation";
import { CardLayout } from "../CardLayout";

export function ProfileSidebar({ userId }: { userId: string }) {
  const items = PUBLIC_PROFILE_NAV_ITEMS(userId);

  return (
    <BaseSidebar collapsible="none">
      <SidebarGroup className="p-0">
        <CardLayout className="shadow-sm border-none">
          <div className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase bg-muted/30">
            Hồ sơ
          </div>
          {items.map((item, index) => (
            <QuickNavItem key={item.label} item={item} showBorder={index > 0} />
          ))}
        </CardLayout>
      </SidebarGroup>
    </BaseSidebar>
  );
}
