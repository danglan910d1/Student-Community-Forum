import { useMutation, useQueryClient } from "@tanstack/react-query";
import { topicService } from "../services/topicService";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useRestoreTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => topicService.restoreTopic(id),
    onSuccess: () => {
      toast.success("Khôi phục chủ đề thành công!");

      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-topics"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message || "Không thể khôi phục chủ đề";
      toast.error(message);
    },
  });
}
