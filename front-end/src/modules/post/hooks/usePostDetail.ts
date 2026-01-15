"use client";

import { useQuery } from "@tanstack/react-query";
import { postService } from "../services/postService";
import { IPost } from "../types";

/**
 * Hook lấy chi tiết 1 bài viết
 * - placeholderData lấy từ cache list bài viết
 * - cache list tự động cập nhật khi dữ liệu chi tiết thay đổi
 */
export const usePostDetail = (postId: string, adminView: boolean = false) => {
  return useQuery<IPost, Error>({
    queryKey: ["post", postId, adminView],
    queryFn: () => postService.getPostById(postId, adminView),
    enabled: !!postId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};
