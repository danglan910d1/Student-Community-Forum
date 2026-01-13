"use client";

import { CardLayout } from "@/components/layout/CardLayout";
import { UserHeader } from "@/modules/user/components/Profile/UserHeader";
import { usePathname, useParams } from "next/navigation";
import { useMe } from "@/modules/user/hooks/useMe";
import { useUserDetail } from "@/modules/user/hooks/useUserDetail";
import { useAuthStore } from "@/stores/useAuthStore";
import { ProfilePublicContainer } from "@/components/layout/Profile/ProfilePublicContainer";
import { DashboardContainer } from "@/components/layout/Dashboard/DashboardContainer";

export default function ProfileDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const { user: currentUser } = useAuthStore();

  // 1. Xác định ngữ cảnh: Đang ở Dashboard hay Profile công khai?
  const isDashboard = pathname.startsWith("/dashboard");
  const targetId = params.id as string;

  // 2. Lấy dữ liệu phù hợp
  const { data: me, isLoading: isMeLoading } = useMe();
  const { data: otherUser, isLoading: isOtherLoading } =
    useUserDetail(targetId);

  // 3. Quyết định hiển thị
  const displayUser = isDashboard ? me : otherUser;
  const isLoading = isDashboard ? isMeLoading : isOtherLoading;
  const isMine = isDashboard || currentUser?.userId === targetId;

  // 4. Chọn Container phù hợp (Chứa Sidebar tương ứng)
  const Container = isDashboard ? DashboardContainer : ProfilePublicContainer;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <CardLayout className="p-0 border-none shadow-sm bg-transparent">
        <div className="px-5 animate-in fade-in duration-700">
          <div className="pt-5">
            {/* UserHeader nhận props để tái sử dụng */}
            <UserHeader
              user={displayUser}
              isLoading={isLoading}
              isMine={isMine}
            />
          </div>

          <div className="flex-1">
            {/* Render DashboardContainer hoặc ProfilePublicContainer dựa trên Route */}
            <Container>{children}</Container>
          </div>
        </div>
      </CardLayout>
    </div>
  );
}
