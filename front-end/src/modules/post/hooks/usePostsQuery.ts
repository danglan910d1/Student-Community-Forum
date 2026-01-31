import { useQuery } from "@tanstack/react-query";
import { postService } from "@/modules/post/services/postService";
import { AxiosError } from "axios";
import { IGetPostsRequestParams, IPostResponse } from "@/modules/post/types";

export const usePostsQuery = (params: IGetPostsRequestParams) => {
  return useQuery<IPostResponse, AxiosError>({
    queryKey: ["posts", params],
    queryFn: () => postService.getPosts(params),
    staleTime: 0,
    gcTime: 0,
    // Thêm cái này để bỏ qua mọi cache trung gian
    meta: {
      headers: { "Cache-Control": "no-cache" },
    },
  });
};
