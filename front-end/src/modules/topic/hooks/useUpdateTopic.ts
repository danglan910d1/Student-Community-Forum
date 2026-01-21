"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { topicService } from "../services/topicService";
import { toast } from "sonner";
import { ITopic } from "../types";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface UpdateTopicPayload {
  id: string;
  body: Partial<ITopic>;
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, body }: UpdateTopicPayload) =>
      topicService.updateTopic(id, body),
    onSuccess: (data) => {
      toast.success("Cập nhật thông tin chủ đề thành công!");

      // 1. Invalidate các query liên quan để đồng bộ dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-topics"] });

      // Quan trọng: Invalidate cả query chi tiết của chính topic đó nếu có
      queryClient.invalidateQueries({ queryKey: ["topic", data.topicId] });

      // 2. Lấy status mới từ dữ liệu trả về của Backend
      const status = data.status || "approved";

      // 3. Điều hướng về bảng danh sách tương ứng với status vừa cập nhật
      // Việc này giúp Admin thấy ngay topic đó đã nhảy sang tab mới (ví dụ từ Pending sang Approved)
      router.push(`/dashboard/admin/taxonomy/topic?status=${status}&page=1`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message || "Không thể cập nhật chủ đề";
      toast.error(message);
    },
  });
}
