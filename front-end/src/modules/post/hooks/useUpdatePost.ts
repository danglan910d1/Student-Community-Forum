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
    onSuccess: (data) => {
      toast.success("Cập nhật bài viết thành công!");

      // Invalidate để các component khác (như List bài viết) lấy data mới
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });

      // Điều hướng dựa trên trạng thái bài viết sau khi update
      if (data.status === "approved") {
        router.push(`/posts/${postId}/${data.slug}`);
      } else {
        router.push(`/dashboard/posts?status=${data.status}`);
      }

      router.refresh();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message || "Không thể cập nhật bài viết";
      toast.error(message);
    },
  });
}
