import { useQuery } from "@tanstack/react-query";
import { postService } from "@/modules/post/services/postService";
import { AxiosError } from "axios";
import { IGetPostsRequestParams, IPostResponse } from "@/modules/post/types";

export const usePostsQuery = (params: IGetPostsRequestParams) => {
  // Cách tốt nhất: Đưa object params vào key để theo dõi mọi sự thay đổi
  const queryKey = ["posts", params];

  return useQuery<IPostResponse, AxiosError>({
    queryKey,
    queryFn: () => postService.getPosts(params),
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
