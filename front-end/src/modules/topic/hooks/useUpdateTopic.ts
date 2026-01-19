import { useMutation, useQueryClient } from "@tanstack/react-query";
import { topicService } from "../services/topicService";
import { toast } from "sonner";
import { ITopic } from "../types";
import { AxiosError } from "axios";

interface UpdateTopicPayload {
  id: string;
  body: Partial<ITopic>;
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: UpdateTopicPayload) =>
      topicService.updateTopic(id, body),
    onSuccess: () => {
      toast.success("Cập nhật thông tin chủ đề thành công!");

      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-topics"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message || "Không thể cập nhật chủ đề";
      toast.error(message);
    },
  });
}
