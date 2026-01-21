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
  const { user: authUser } = useAuthStore();

  // 1. Xác định ngữ cảnh chính xác
  const isDashboard = pathname.startsWith("/dashboard");
  const targetId = params.id as string;

  // 2. Gọi Hook có điều kiện (Tránh fetch thừa)
  // Lấy dữ liệu của tôi (luôn dùng cho Dashboard)
  const { data: me, isLoading: isMeLoading } = useMe();

  // Chỉ lấy dữ liệu người khác nếu KHÔNG phải dashboard và có targetId
  const { data: otherUser, isLoading: isOtherLoading } = useUserDetail(
    !isDashboard ? targetId : ""
  );

  // 3. Quyết định hiển thị dựa trên ngữ cảnh
  const displayUser = isDashboard ? me : otherUser;
  const isLoading = isDashboard ? isMeLoading : isOtherLoading;

  // Logic isMine mới:
  // - Nếu là Dashboard: Chắc chắn là của mình (true)
  // - Nếu là Profile: Check ID người đang xem với ID trong URL
  const isMine = isDashboard || (!!authUser && authUser.userId === targetId);

  // 4. Chọn Container
  const Container = isDashboard ? DashboardContainer : ProfilePublicContainer;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <CardLayout className="p-0 border-none shadow-sm bg-transparent">
        <div className="px-5 animate-in fade-in duration-700">
          <div className="pt-5">
            <UserHeader
              user={displayUser}
              isLoading={isLoading}
              isMine={isMine}
            />
          </div>

          <div className="flex-1">
            <Container>{children}</Container>
          </div>
        </div>
      </CardLayout>
    </div>
  );
}
