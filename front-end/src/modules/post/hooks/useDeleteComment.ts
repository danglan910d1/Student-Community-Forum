import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "../services/commentService";
import { toast } from "sonner";

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: () => {
      toast.success("Đã xóa bình luận");
      // Invalidate để refetch lại danh sách bình luận mới nhất
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: () => {
      toast.error("Không thể xóa bình luận, vui lòng thử lại");
    },
  });
}
