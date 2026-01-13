// src/modules/user/hooks/useUpdateProfile.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { useAuthStore } from "@/stores/useAuthStore";
import { UpdateProfileRequest } from "../types";
import { toast } from "sonner";
import { ApiError } from "@/types/common";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateProfile: updateStore } = useAuthStore();

  return useMutation({
    mutationFn: ({
      data,
      requestId,
    }: {
      data: UpdateProfileRequest;
      requestId?: string;
    }) => userService.updateProfile(data, requestId),
    onSuccess: (updatedUser) => {
      // Cập nhật cache của React Query ngay lập tức để UserHeader hiển thị data mới
      queryClient.setQueryData(["user", "me"], updatedUser);

      // Đồng bộ vào Zustand Store
      updateStore({
        name: updatedUser.name,
        avatar: updatedUser.avatar || undefined,
      });

      toast.success("Hồ sơ đã được cập nhật thành công!");
    },
    onError: (error: ApiError) => {
      // Bây giờ error.response.data.message sẽ được TypeScript hiểu
      toast.error(error.response?.data?.message || "Cập nhật hồ sơ thất bại");
    },
  });
}
