"use client";

import { BaseSidebar } from "@/components/layout/BaseSidebar";
import { SidebarGroup } from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { QuickNavItem } from "@/components/shared/Navigation/QuickNavigation/QuickNavItem";
import { DASHBOARD_NAV_ITEMS, ADMIN_NAV_GROUPS } from "@/constants/navigation";
import { CardLayout } from "../CardLayout";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavStore } from "@/stores/useNavStore";

export function DashboardSidebar() {
  const { user } = useAuthStore();
  const activeLabel = useNavStore((state) => state.activeLabel);
  const isAdmin = user?.role === "admin";

  return (
    <BaseSidebar collapsible="none">
      <div className="flex flex-col gap-4">
        {/* GROUP 1: CÁ NHÂN */}
        <SidebarGroup className="p-0">
          <CardLayout className="shadow-sm border-none p-0 overflow-hidden">
            <div className="px-3 py-3 text-xs font-bold text-muted-foreground uppercase bg-muted/30">
              Cá nhân
            </div>
            {DASHBOARD_NAV_ITEMS.map((item, index) => (
              <QuickNavItem
                key={item.label}
                item={item}
                showBorder={index > 0}
              />
            ))}
          </CardLayout>
        </SidebarGroup>

        {/* GROUP 2: QUẢN TRỊ (Dành cho Admin) */}
        {isAdmin && (
          <SidebarGroup className="p-0 flex flex-col gap-4">
            {Object.values(ADMIN_NAV_GROUPS).map((group) => {
              // Tự động mở menu nếu có item bên trong đang active
              const isGroupActive = group.items.some(
                (item) => item.label === activeLabel
              );

              return (
                <Collapsible
                  key={group.label}
                  className="group/collapsible"
                  defaultOpen={isGroupActive}
                >
                  <CardLayout className="shadow-sm border-none p-0 overflow-hidden">
                    <div className="px-3 py-3 text-xs font-bold text-muted-foreground uppercase bg-muted/30">
                      {group.triggerLabel}
                    </div>
                    <CollapsibleTrigger asChild>
                      <QuickNavItem
                        item={{
                          label: group.label,
                          icon: group.icon,
                          iconBg: group.iconBg,
                          iconColor: group.iconColor,
                        }}
                        showBorder={false}
                        isTrigger={true}
                        className="group-data-[state=open]/collapsible:bg-muted/50"
                      />
                    </CollapsibleTrigger>

                    <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                      {group.items.map((item) => (
                        <QuickNavItem
                          key={item.label}
                          item={item}
                          showBorder={true}
                        />
                      ))}
                    </CollapsibleContent>
                  </CardLayout>
                </Collapsible>
              );
            })}
          </SidebarGroup>
        )}
      </div>
    </BaseSidebar>
  );
}
