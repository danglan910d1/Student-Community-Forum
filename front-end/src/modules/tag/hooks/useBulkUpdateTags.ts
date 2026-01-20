import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tagService } from "../services/tagService";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { IBulkUpdateTagBody } from "../types";

export function useBulkUpdateTags() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string },
    AxiosError<{ message: string }>,
    IBulkUpdateTagBody
  >({
    mutationFn: tagService.bulkUpdateTags,
    onSuccess: (data) => {
      toast.success(data.message || "Thực hiện thao tác thành công");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Thao tác hàng loạt thất bại",
      );
    },
  });
}
