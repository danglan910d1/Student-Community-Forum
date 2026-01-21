import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tagService } from "../services/tagService";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ICreateTagBody, ITag } from "../types";

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation<ITag, AxiosError<{ message: string }>, ICreateTagBody>({
    mutationFn: tagService.createTag,
    onSuccess: () => {
      toast.success("Tạo thẻ thành công");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Không thể tạo thẻ");
    },
  });
}
