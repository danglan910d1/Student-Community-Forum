"use client";

import { ShieldCheck } from "lucide-react";
import { BaseSidebar } from "@/components/layout/BaseSidebar";
import { SidebarGroup } from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { QuickNavItem } from "@/components/shared/Navigation/QuickNavigation/QuickNavItem";
import { DASHBOARD_NAV_ITEMS, ADMIN_NAV_ITEMS } from "@/constants/navigation";
import { CardLayout } from "../CardLayout";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavStore } from "@/stores/useNavStore";

export function DashboardSidebar() {
  const { user } = useAuthStore();
  const activeLabel = useNavStore((state) => state.activeLabel);
  const isAdmin = user?.role === "admin";

  // Check xem có đang ở trang admin nào không để tự mở menu
  const isAdminActive = ADMIN_NAV_ITEMS.some(
    (item) => item.label === activeLabel
  );

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

        {/* GROUP 2: QUẢN TRỊ */}
        {isAdmin && (
          <SidebarGroup className="p-0">
            <Collapsible
              className="group/collapsible"
              defaultOpen={isAdminActive}
            >
              <CardLayout className="shadow-sm border-none p-0 overflow-hidden">
                <CollapsibleTrigger asChild>
                  <QuickNavItem
                    item={{
                      label: "Quản lý hệ thống",
                      icon: ShieldCheck,
                      iconBg: "bg-red-100",
                      iconColor: "text-red-600",
                    }}
                    showBorder={false}
                    isTrigger={true}
                    // Để CSS xử lý xoay icon dựa trên class của group thay vì truyền isOpen tĩnh
                    className="group-data-[state=open]/collapsible:bg-muted/50"
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  {ADMIN_NAV_ITEMS.map((item) => (
                    <QuickNavItem
                      key={item.label}
                      item={item}
                      showBorder={true}
                    />
                  ))}
                </CollapsibleContent>
              </CardLayout>
            </Collapsible>
          </SidebarGroup>
        )}
      </div>
    </BaseSidebar>
  );
}
