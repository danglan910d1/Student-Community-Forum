"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { likeService } from "../services/likeService";
import { toast } from "sonner"; // Hoặc thư viện thông báo bạn dùng
import {
  ILikeStatusResponse,
  IToggleLikeResponse,
  LikeTargetType,
} from "../types";
import { useAuthStore } from "@/stores/useAuthStore";

interface UseLikeProps {
  targetType: LikeTargetType;
  targetId: string;
  initialLikesCount: number;
}

export function useLike({
  targetType,
  targetId,
  initialLikesCount,
}: UseLikeProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated, hasHydrated } = useAuthStore(); // Lấy trạng thái auth
  const likeStatusQueryKey = ["like-status", targetType, targetId] as const;

  /**
   * 1. GET trạng thái Like
   * Thêm enabled: hasHydrated để chắc chắn query chỉ chạy khi token đã được load từ Storage
   */
  const { data } = useQuery<ILikeStatusResponse>({
    queryKey: likeStatusQueryKey,
    queryFn: () => likeService.getLikeStatus(targetType, targetId),
    enabled: hasHydrated, // Quan trọng: Đợi Zustand load xong token
    initialData: {
      isLiked: false,
      likes_count: initialLikesCount,
    },
    staleTime: 1000 * 60 * 5,
  });

  /**
   * 2. MUTATION Toggle Like
   */
  const toggleLikeMutation = useMutation<
    IToggleLikeResponse,
    Error,
    void,
    { previous?: ILikeStatusResponse }
  >({
    mutationFn: () => {
      // Bảo vệ tầng service: Nếu chưa đăng nhập thì không gọi API
      if (!isAuthenticated) {
        throw new Error("UNAUTHORIZED");
      }
      return likeService.toggleLike(targetType, targetId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: likeStatusQueryKey });
      const previous =
        queryClient.getQueryData<ILikeStatusResponse>(likeStatusQueryKey);

      queryClient.setQueryData<ILikeStatusResponse>(
        likeStatusQueryKey,
        (old) => {
          const isLiked = old?.isLiked ?? false;
          const currentCount = old?.likes_count ?? initialLikesCount;

          return {
            isLiked: !isLiked,
            likes_count: Math.max(0, currentCount + (isLiked ? -1 : 1)),
          };
        }
      );

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(likeStatusQueryKey, context.previous);
      }

      // Thông báo lỗi cho user
      if (error.message === "UNAUTHORIZED") {
        toast.error("Vui lòng đăng nhập để thích bài viết!");
      } else {
        toast.error("Thao tác thất bại, vui lòng thử lại sau.");
      }
    },
    onSuccess: (res) => {
      queryClient.setQueryData<ILikeStatusResponse>(likeStatusQueryKey, {
        isLiked: res.isLiked,
        likes_count: res.likeCount,
      });
    },
  });

  return {
    isLiked: data?.isLiked ?? false,
    likesCount: data?.likes_count ?? initialLikesCount,
    // Bọc thêm 1 lớp check ở UI
    toggleLike: () => {
      if (!isAuthenticated) {
        return toast.error("Bạn cần đăng nhập để thực hiện chức năng này!");
      }
      toggleLikeMutation.mutate();
    },
    isPending: toggleLikeMutation.isPending,
  };
}
