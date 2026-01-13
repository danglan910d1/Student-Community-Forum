"use client";

import { CardLayout } from "@/components/layout/CardLayout";
import { DashboardContainer } from "@/components/layout/Dashboard/DashboardContainer";
import { UserHeader } from "@/modules/user/components/Profile/UserHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Bỏ overflow-visible, để mặc định hoặc dùng flex-1
    <div className="flex-1 flex flex-col min-h-screen">
      <CardLayout className="p-0 border-none shadow-sm bg-transparent">
        <div className="px-5 animate-in fade-in duration-700">
          <div className="pt-5">
            <UserHeader />
          </div>
          {/* DashboardContainer phải cho phép nội dung bên trong co giãn */}
          <div className="flex-1">
            <DashboardContainer>{children}</DashboardContainer>
          </div>
        </div>
      </CardLayout>
    </div>
  );
}
