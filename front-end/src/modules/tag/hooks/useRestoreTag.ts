import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tagService } from "../services/tagService";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useRestoreTag() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string },
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: (id: string) => tagService.restoreTag(id),
    onSuccess: () => {
      toast.success("Khôi phục thẻ thành công");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Khôi phục thất bại");
    },
  });
}
