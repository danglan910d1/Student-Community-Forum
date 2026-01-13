"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMe } from "../hooks/useMe";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

import { Loader2 } from "lucide-react";
import { ProfileFormValues, profileSchema } from "../schemas/profileSchema";
import { ProfileSection } from "../components/Profile/ProfileSection";

export function ProfileContainer() {
  const { data: user, isLoading: isFetching } = useMe();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  // Khởi tạo form với type chuẩn
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      avatar: "",
    },
  });

  // Đồng bộ dữ liệu từ API vào Form khi user có dữ liệu
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      });
    }
  }, [user, form]);

  const handleSubmit = (values: ProfileFormValues) => {
    // values ở đây tự động mang kiểu ProfileFormValues, không cần as any
    updateProfile({ data: values });
  };

  if (isFetching) {
    return (
      <div className="flex flex-col justify-center items-center h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Đang tải thông tin cá nhân...
        </p>
      </div>
    );
  }

  return (
    <ProfileSection
      form={form} // Truyền form đã có type ProfileFormValues
      onSubmit={handleSubmit}
      isUpdating={isUpdating}
    />
  );
}
