// src/modules/user/hooks/useAdminUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { IGetAdminUsersParams } from "../types";
import { toast } from "sonner";
import { ApiError, UserRole, UserStatus } from "@/types/common";

export function useAdminUsers(params: IGetAdminUsersParams) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => userService.getAdminUsers(params),
    placeholderData: (prev) => prev,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
      requestId,
    }: {
      id: string;
      // FIX: Thay 'any' bằng type chính xác
      payload: { status?: UserStatus; role?: UserRole };
      requestId?: string;
    }) => userService.updateUserStatus(id, payload, requestId),

    onSuccess: (_, variables) => {
      // Làm mới danh sách admin
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      // Làm mới chi tiết user cụ thể
      queryClient.invalidateQueries({
        queryKey: ["user", "detail", variables.id],
      });
      toast.success("Cập nhật trạng thái người dùng thành công");
    },

    onError: (error: ApiError) => {
      // FIX: Thay 'any' bằng 'ApiError'
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    },
  });
}
