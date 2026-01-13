"use client";

import { useMutation } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { UpdatePasswordRequest } from "../types";
import { toast } from "sonner";
import { ApiError } from "@/types/common";

export function useUpdatePassword() {
  return useMutation({
    mutationFn: ({
      data,
      requestId,
    }: {
      data: UpdatePasswordRequest;
      requestId?: string;
    }) => {
      // Dùng hàm có sẵn của trình duyệt, không cần cài 'uuid'
      const finalRequestId = requestId || crypto.randomUUID();
      return userService.updatePassword(data, finalRequestId);
    },
    onSuccess: (res) => {
      toast.success(res.message || "Mật khẩu đã được thay đổi thành công!");
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.message ||
        "Cập nhật mật khẩu thất bại. Vui lòng thử lại!";
      toast.error(errorMessage);
    },
  });
}
