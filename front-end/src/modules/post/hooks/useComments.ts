import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { commentService } from "../services/commentService";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";

// --- HOOK 1: QUẢN LÝ COMMENT TẦNG 1 (ROOT) ---
export function useComments(postId: string) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  // QueryKey cho tầng gốc (parentId = null)
  const rootQueryKey = ["comments", postId, null, isAuthenticated];

  const query = useInfiniteQuery({
    queryKey: rootQueryKey,
    queryFn: ({ pageParam = 1 }) =>
      commentService.getComments(postId, pageParam, 10, null),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const createMutation = useMutation({
    mutationFn: commentService.createComment,
    onSuccess: (_, variables) => {
      // Invalidate toàn bộ prefix để cập nhật cả danh sách và số lượng replies_count
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success(variables.parentId ? "Đã trả lời" : "Đã đăng");
    },
  });

  // --- THÊM MỚI: Mutation Update ---
  const updateMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => commentService.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Đã cập nhật bình luận");
    },
  });

  return {
    ...query,
    comments: query.data?.pages.flatMap((page) => page.comments) || [],
    totalItems: query.data?.pages[0]?.pagination.totalItems || 0,
    createComment: (content: string, parentId: string | null = null) =>
      createMutation.mutateAsync({ postId, content, parentId }),
    updateComment: (commentId: string, content: string) =>
      updateMutation.mutateAsync({ commentId, content }),
  };
}

// --- HOOK 2: QUẢN LÝ REPLIES (TẦNG 2, 3, 4...) ---
export function useReplies(postId: string, parentId: string) {
  const { isAuthenticated } = useAuthStore();
  const queryKey = ["comments", postId, parentId, isAuthenticated];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      commentService.getComments(postId, pageParam, 5, parentId),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!parentId,
  });

  return {
    ...query,
    replies: query.data?.pages.flatMap((page) => page.comments) || [],
  };
}
