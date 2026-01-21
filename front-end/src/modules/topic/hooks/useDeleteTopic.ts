import { useMutation, useQueryClient } from "@tanstack/react-query";
import { topicService } from "../services/topicService";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => topicService.deleteTopic(id),
    onSuccess: () => {
      toast.success("Chủ đề đã được chuyển vào thùng rác!");

      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-topics"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || "Lỗi khi xóa chủ đề";
      toast.error(message);
    },
  });
}
