import { useQuery } from "@tanstack/react-query";
import { postService } from "@/modules/post/services/postService";
import { AxiosError } from "axios";
import { IGetPostsParams, IPostResponse } from "@/modules/post/types";

export const usePostsQuery = (params: IGetPostsParams) => {
  const queryKey = [
    "posts",
    params.page,
    params.topicSlug ?? "",
    params.tagSlug ?? "",
    params.sortBy ?? "",
    params.is_resolved ?? false,
  ];

  return useQuery<IPostResponse, AxiosError>({
    queryKey,
    queryFn: () => postService.getPosts(params),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};
