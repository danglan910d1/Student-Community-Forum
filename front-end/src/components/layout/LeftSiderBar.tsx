import { UserInfo } from "@/components/shared/UserInfo";
import { QuickNavigation } from "@/components/shared/Navigation/QuickNavigation/QuickNavigation";
import { PopularTags } from "@/modules/tag/components/PopularTag";

export function LeftSidebar() {
  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Nhóm điều hướng nhanh */}
      <QuickNavigation />

      {/* 2. Popular Tags (Chiếm phần lớn diện tích, tự scroll bên trong) */}
      <div className="flex-1 overflow-hidden py-1">
        <PopularTags />
      </div>

      {/* 3. User Info (Nằm dưới cùng) */}

      <div className="py-1">
        <UserInfo />
      </div>
    </div>
  );
}
