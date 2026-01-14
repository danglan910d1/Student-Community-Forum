"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, usePathname } from "next/navigation";

import { useMe } from "../hooks/useMe";
import { useUserDetail } from "../hooks/useUserDetail";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

import { Loader2 } from "lucide-react";
import { ProfileFormValues, profileSchema } from "../schemas/profileSchema";
import { ProfileSection } from "../components/Profile/ProfileSection";

export function ProfileContainer() {
  const params = useParams();
  const pathname = usePathname();
  const targetId = params.id as string;

  // 1. Xác định ngữ cảnh Dashboard
  const isDashboard = pathname.startsWith("/dashboard");

  // 3. Xử lý ID an toàn cho useUserDetail
  const effectiveId = isDashboard ? "" : targetId || "";

  // 4. Fetch cả 2 nguồn dữ liệu
  const { data: me, isLoading: isMeFetching } = useMe();
  const { data: otherUser, isLoading: isOtherFetching } =
    useUserDetail(effectiveId);

  // 5. QUAN TRỌNG: Quyết định lấy dữ liệu từ nguồn nào
  // - Nếu ở dashboard: Chắc chắn lấy 'me'
  // - Nếu ở profile công khai: Luôn lấy 'otherUser' (kể cả khi targetId là của mình)
  const user = isDashboard ? me : otherUser;

  // Trạng thái loading tương ứng
  const isFetching = isDashboard ? isMeFetching : isOtherFetching;

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", avatar: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
      });
    }
  }, [user, form]);

  if (isFetching) {
    return (
      <div className="flex flex-col justify-center items-center h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Đang tải hồ sơ...
        </p>
      </div>
    );
  }

  return (
    <ProfileSection
      form={form}
      onSubmit={(values) => updateProfile({ data: values })}
      isUpdating={isUpdating}
      isMine={isDashboard}
    />
  );
}
