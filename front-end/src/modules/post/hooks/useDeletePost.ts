import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "../services/postService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

export function useDeletePost() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: (_, postId) => {
      toast.success("Đã xóa bài viết thành công!");

      // Xóa cache để danh sách cập nhật lại
      queryClient.invalidateQueries({ queryKey: ["posts"], type: "active" });
      // Xóa luôn cache của bài viết cụ thể đó
      queryClient.removeQueries({ queryKey: ["post", postId] });
      router.push("/posts");
      router.refresh();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message || "Đã xảy ra lỗi khi xoá bài viết";
      toast.error(message);
    },
  });
}
