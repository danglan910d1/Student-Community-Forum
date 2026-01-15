import { useQuery } from "@tanstack/react-query";
import { postService } from "@/modules/post/services/postService";
import { AxiosError } from "axios";
import { IGetPostsRequestParams, IPostResponse } from "@/modules/post/types";

export const usePostsQuery = (params: IGetPostsRequestParams) => {
  const queryKey = [
    "posts",
    params.adminView ?? false,
    params.page,
    params.status ?? "all",
    params.topicSlug ?? "",
    params.tagSlug ?? "",
    params.sortBy ?? "",
    params.is_resolved ?? false,
    params.myPosts ?? false,
    params.userId ?? "",
  ];

  return useQuery<IPostResponse, AxiosError>({
    queryKey,
    queryFn: () => postService.getPosts(params),
    staleTime: 0, // Dữ liệu luôn cũ, sẽ fetch lại khi component mount
    gcTime: 1000 * 60 * 5, // (Tên mới của cacheTime) Giữ trong bộ nhớ đệm 5 phút
    refetchOnWindowFocus: true, // Tự động lấy lại dữ liệu khi quay lại tab
    retry: 1, // Thử lại 1 lần nếu lỗi
  });
};
