import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "../services/postService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IAdminApprovePostBody } from "../types";
import { AxiosError } from "axios";

// modules/post/hooks/useAdminApprovePost.ts
export function useAdminApprovePost(postId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: IAdminApprovePostBody) =>
      postService.adminApprovePost(postId, body),

    onSuccess: (data) => {
      // Giả sử API trả về data có chứa slug mới hoặc slug cũ của bài viết
      // data: { status: "approved", slug: "tieu-de-bai-viet", ... }
      const slug = data.slug;
      const isApproved = data.status === "approved";

      toast.success(
        isApproved
          ? "Đã duyệt bài viết và cập nhật thẻ thành công!"
          : "Đã từ chối bài viết thành công!"
      );

      // Invalidate các queries liên quan
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });

      // ĐIỀU HƯỚNG: Sử dụng slug từ data trả về
      if (isApproved && slug) {
        router.push(`/posts/${postId}/${slug}`);
      } else {
        // Nếu bị từ chối hoặc không có slug, quay lại danh sách chờ duyệt
        router.push("/dashboard/admin/posts?status=rejected");
      }

      router.refresh();
    },

    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || "Lỗi xử lý duyệt bài";
      toast.error(message);
    },
  });
}
