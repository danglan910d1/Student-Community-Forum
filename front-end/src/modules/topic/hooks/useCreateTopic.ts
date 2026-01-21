"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { topicService } from "../services/topicService";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { TopicInput } from "../schemas/topicSchemas";

export function useCreateTopic() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    // Sử dụng TopicInput để khớp với dữ liệu từ Form
    mutationFn: (body: TopicInput) => topicService.createTopic(body),
    onSuccess: (data) => {
      toast.success("Chủ đề mới đã được tạo thành công!");

      // Invalidate để các bảng dữ liệu tự động fetch lại bản mới nhất
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-topics"] });

      // Lấy status từ data trả về của Backend
      const status = data.status || "approved";

      // Điều hướng Admin về đúng tab danh sách theo status vừa tạo
      router.push(`/dashboard/admin/taxonomy/topic?status=${status}&page=1`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo chủ đề";
      toast.error(message);
    },
  });
}
