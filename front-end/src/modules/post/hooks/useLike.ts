"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { likeService } from "../services/likeService";
import { toast } from "sonner";
import {
  ILikeStatusResponse,
  IToggleLikeResponse,
  LikeTargetType,
} from "../types";
import { useAuthStore } from "@/stores/useAuthStore";

interface UseLikeProps {
  targetType: LikeTargetType;
  targetId: string;
  initialLikesCount: number; // Chỉ nhận count để hiển thị số lúc chưa load
}

export function useLike({
  targetType,
  targetId,
  initialLikesCount,
}: UseLikeProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const likeStatusQueryKey = [
    "like-status",
    targetType,
    targetId,
    isAuthenticated,
  ] as const;

  // 1. GET trạng thái: KHÔNG dùng initialData để ép buộc isLoading = true
  const { data, isLoading } = useQuery<ILikeStatusResponse>({
    queryKey: likeStatusQueryKey,
    queryFn: () => likeService.getLikeStatus(targetType, targetId),
    enabled: hasHydrated,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // 2. TOGGLE: Chỉ chạy khi data từ Query đã tồn tại
  const toggleLikeMutation = useMutation<
    IToggleLikeResponse,
    Error,
    void,
    { previous?: ILikeStatusResponse }
  >({
    mutationFn: () => {
      if (!isAuthenticated) throw new Error("UNAUTHORIZED");
      return likeService.toggleLike(targetType, targetId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: likeStatusQueryKey });
      const previous =
        queryClient.getQueryData<ILikeStatusResponse>(likeStatusQueryKey);

      // Optimistic Update: Chỉ chạy nếu đã có dữ liệu từ lệnh GET trước đó
      if (previous) {
        queryClient.setQueryData<ILikeStatusResponse>(likeStatusQueryKey, {
          isLiked: !previous.isLiked,
          likes_count: Math.max(
            0,
            previous.likes_count + (previous.isLiked ? -1 : 1)
          ),
        });
      }

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(likeStatusQueryKey, context.previous);
      }
      toast.error(
        error.message === "UNAUTHORIZED"
          ? "Vui lòng đăng nhập!"
          : "Thao tác thất bại"
      );
    },
    onSuccess: (res) => {
      queryClient.setQueryData<ILikeStatusResponse>(likeStatusQueryKey, {
        isLiked: res.isLiked,
        likes_count: res.likeCount,
      });
    },
  });

  return {
    // isLiked chỉ TRUE khi và chỉ khi Server trả về TRUE
    isLiked: data?.isLiked ?? false,

    // likesCount ưu tiên từ Server, nếu chưa có thì dùng tạm số ban đầu từ Post/Comment
    likesCount: data?.likes_count ?? initialLikesCount,

    toggleLike: () => {
      if (!isAuthenticated) return toast.error("Bạn cần đăng nhập!");
      // BẮT BUỘC: Nếu chưa GET xong (isLoading) hoặc data chưa có thì không cho Toggle
      if (isLoading || !data) return;

      toggleLikeMutation.mutate();
    },

    // isPending = true khi đang load trạng thái ban đầu HOẶC đang xử lý bấm Like
    isPending: isLoading || toggleLikeMutation.isPending,

    // Trạng thái load ban đầu để UI có thể hiển thị skeleton nếu muốn
    isInitialLoading: isLoading,
  };
}
