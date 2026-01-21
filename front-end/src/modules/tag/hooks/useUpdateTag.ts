import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tagService } from "../services/tagService";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ICreateTagBody, ITag } from "../types";

interface UpdateTagParams {
  id: string;
  body: Partial<ICreateTagBody>;
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation<ITag, AxiosError<{ message: string }>, UpdateTagParams>({
    mutationFn: ({ id, body }) => tagService.updateTag(id, body),
    onSuccess: (data) => {
      toast.success(`Cập nhật thẻ "${data.name}" thành công`);

      // 1. Invalidate toàn bộ query liên quan đến "tags" để refetch dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: ["tags"] });

      // 2. Cập nhật cache cho chính tag cụ thể này (nếu bạn có trang Detail)
      queryClient.setQueryData(["tags", "admin", data.tagId], data);
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || "Cập nhật thất bại";
      toast.error(errorMsg);
    },
  });
}
