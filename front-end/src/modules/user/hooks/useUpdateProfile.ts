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
      // 1. Cập nhật React Query
      queryClient.setQueryData(["user", "me"], updatedUser);

      // 2. Cập nhật Zustand Store bằng dữ liệu MỚI NHẤT từ server
      // Interceptor đã đảm bảo updatedUser.avatar là port 5000
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
