import { useQuery } from "@tanstack/react-query";
import { postService } from "@/modules/post/services/postService";
import React from "react";
import {
  IPost,
  IPostResponse,
  IGetPostsRequestParams,
} from "@/modules/post/types/index";

export function useGlobalSearch(query: string) {
  const debouncedQuery = useDebounce(query.trim(), 300);

  const { params, mode } = React.useMemo(() => {
    const term = debouncedQuery;

    // Khởi tạo object với type IGetPostsRequestParams
    // Nếu IGetListParams yêu cầu number, hãy truyền 10 thay vì "10"
    const resultParams: IGetPostsRequestParams = {
      limit: 10, // Sửa thành number để khớp với IGetListParams
    };

    const mode = { isTag: false, isUser: false, isTopic: false };

    if (!term) return { params: resultParams, mode };

    if (term.startsWith("[") && term.endsWith("]")) {
      resultParams.tagSlug = term.slice(1, -1).trim();
      mode.isTag = true;
    } else if (term.startsWith("user:")) {
      resultParams.search = term.replace("user:", "").trim();
      mode.isUser = true;
    } else if (term.startsWith("topic:")) {
      resultParams.topicSlug = term.replace("topic:", "").trim();
      mode.isTopic = true;
    } else {
      resultParams.search = term;
    }

    return { params: resultParams, mode };
  }, [debouncedQuery]);

  const enabled = debouncedQuery.length >= 1;

  const postsQuery = useQuery<IPostResponse>({
    queryKey: ["search", "global", params],
    queryFn: () => postService.getPosts(params),
    enabled: enabled,
    staleTime: 1000 * 60,
    placeholderData: (previousData) => previousData,
  });

  const extractedResults = React.useMemo(() => {
    const posts = postsQuery.data?.posts || [];

    // Định nghĩa type chính xác cho Map dựa trên interface IPost
    const tagsMap = new Map<string, IPost["tags"][number]>();
    const topicsMap = new Map<string, NonNullable<IPost["topic"]>>();

    posts.forEach((post) => {
      if (post.topic) {
        topicsMap.set(post.topic.topicId, post.topic);
      }
      post.tags?.forEach((tag) => {
        tagsMap.set(tag.tagId, tag);
      });
    });

    return {
      posts,
      tags: Array.from(tagsMap.values()),
      topics: Array.from(topicsMap.values()),
    };
  }, [postsQuery.data]);

  const isActualLoading =
    postsQuery.isLoading || (enabled && postsQuery.isFetching);

  return {
    results: extractedResults,
    mode,
    isLoading: isActualLoading,
    isError: postsQuery.isError,
  };
}

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = React.useState<string>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
