// src/hooks/useComments.ts
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { commentService } from "../services/commentService";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";

export function useComments(postId: string) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const queryKey = ["comments", postId, isAuthenticated];

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam = 1 }) =>
        commentService.getComments(postId, pageParam),
      getNextPageParam: (lastPage) => {
        const { currentPage, totalPages } = lastPage.pagination;
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      initialPageParam: 1,
    });

  const createMutation = useMutation({
    mutationFn: commentService.createComment,
    onSuccess: () => {
      // Invalidate để refetch danh sách mới nhất
      queryClient.invalidateQueries({ queryKey });
      toast.success("Đã đăng bình luận");
    },
    onError: () => toast.error("Gửi bình luận thất bại"),
  });

  return {
    // Lưu ý: key truy cập mảng là "comments" dựa trên IApiResponse
    comments: data?.pages.flatMap((page) => page.comments) || [],
    totalItems: data?.pages[0]?.pagination.totalItems || 0,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    createComment: (content: string, parentId: string | null = null) =>
      createMutation.mutateAsync({ postId, content, parentId }),
  };
}
