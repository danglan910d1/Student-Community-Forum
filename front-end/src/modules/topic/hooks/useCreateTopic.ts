import { useMutation, useQueryClient } from "@tanstack/react-query";
import { topicService } from "../services/topicService";
import { toast } from "sonner";
import { ITopic } from "../types";
import { AxiosError } from "axios";

export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<ITopic>) => topicService.createTopic(body),
    onSuccess: () => {
      toast.success("Chủ đề mới đã được tạo thành công!");

      // Invalidate cả danh sách public và admin
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-topics"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo chủ đề";
      toast.error(message);
    },
  });
}
