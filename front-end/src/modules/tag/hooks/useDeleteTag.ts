import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tagService } from "../services/tagService";
import { toast } from "sonner";
import { AxiosError } from "axios";

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string },
    AxiosError<{ message: string }>,
    string
  >({
    mutationFn: (id: string) => tagService.deleteTag(id),
    onSuccess: () => {
      toast.success("Đã chuyển thẻ vào thùng rác");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Không thể xóa thẻ");
    },
  });
}
