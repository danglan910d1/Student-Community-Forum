"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

import { useMe } from "../hooks/useMe";
import { useUserDetail } from "../hooks/useUserDetail";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

import { Loader2 } from "lucide-react";
import { ProfileFormValues, profileSchema } from "../schemas/profileSchema";
import { ProfileSection } from "../components/Profile/ProfileSection";

export function ProfileContainer() {
  const params = useParams();
  const targetId = params.id as string;
  const { user: currentUser } = useAuthStore();

  // Xác định xem đây là trang cá nhân hay trang người khác
  const isMine = useMemo(() => {
    return !targetId || targetId === currentUser?.userId;
  }, [targetId, currentUser?.userId]);

  // Fetch dữ liệu dựa trên ngữ cảnh
  const { data: me, isLoading: isMeFetching } = useMe();
  const { data: otherUser, isLoading: isOtherFetching } =
    useUserDetail(targetId);

  const user = isMine ? me : otherUser;
  const isFetching = isMine ? isMeFetching : isOtherFetching;

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", avatar: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
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
      isMine={isMine} // Quan trọng: Truyền quyền sở hữu xuống
    />
  );
}
