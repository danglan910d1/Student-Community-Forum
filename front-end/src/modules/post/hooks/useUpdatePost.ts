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
      // Làm mới danh sách và chi tiết bài viết
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      // 2. Kiểm soát logic điều hướng dựa trên status
      if (data.status === "approved") {
        // Nếu đã duyệt -> Xem bài viết công khai
        router.push(`/posts/${postId}/${data.slug}`);
      } else {
        // Nếu là pending hoặc rejected -> Về quản lý bài viết cá nhân kèm filter status
        // data.status lúc này thường là 'pending' hoặc 'rejected'
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
