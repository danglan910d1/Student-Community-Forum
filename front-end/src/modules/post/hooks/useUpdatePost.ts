import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "../services/postService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ICreatePostBody } from "../types";
import { AxiosError } from "axios";

export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: ICreatePostBody) => postService.updatePost(postId, body),
    onSuccess: () => {
      toast.success("Cập nhật bài viết thành công!");
      // Làm mới danh sách và chi tiết bài viết
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });

      router.push("/posts");
      router.refresh();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message || "Không thể cập nhật bài viết";
      toast.error(message);
    },
  });
}
