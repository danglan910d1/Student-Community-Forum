// modules/post/hooks/useCreatePost.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "../services/postService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ICreatePostBody } from "../types";
import { AxiosError } from "axios";

export function useCreatePost() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: ICreatePostBody) => postService.createPost(body),
    onSuccess: (newPost) => {
      toast.success("Bài viết đã được tạo và đang chờ duyệt!");

      // Xóa cache danh sách bài viết để khi quay lại trang chủ sẽ thấy dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      router.push("/dashboard/posts?status=pending");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo bài viết";
      toast.error(message);
    },
  });
}
