// hooks/useGlobalSearch.ts
import { useQuery } from "@tanstack/react-query";
import { postService } from "@/modules/post/services/postService";
import React from "react";

export function useGlobalSearch(query: string) {
  const debouncedQuery = useDebounce(query.trim(), 300);

  // 1. Phân tích cú pháp (giữ lại để hiển thị UI hint nếu cần)
  const isTagSearch =
    debouncedQuery.startsWith("[") && debouncedQuery.endsWith("]");
  const isUserSearch = debouncedQuery.startsWith("user:");
  const isTopicSearch = debouncedQuery.startsWith("topic:");

  // 2. Làm sạch query để gửi lên server
  const cleanQuery = React.useMemo(() => {
    let val = debouncedQuery;
    if (isTagSearch) val = val.slice(1, -1);
    else if (isUserSearch) val = val.replace("user:", "");
    else if (isTopicSearch) val = val.replace("topic:", "");
    return val.trim();
  }, [debouncedQuery, isTagSearch, isUserSearch, isTopicSearch]);

  const enabled = cleanQuery.length >= 1;

  // 3. Chỉ tập trung vào postsQuery
  const postsQuery = useQuery({
    queryKey: ["search", "global", cleanQuery],
    queryFn: () =>
      postService.getPosts({
        search: cleanQuery,
        limit: 10, // Tăng limit một chút vì ta sẽ trích xuất tag/topic từ đây
      }),
    enabled: enabled,
    retry: false, // Tắt retry để tránh spam server khi gõ tiếng Việt chưa hoàn thiện
  });

  // 4. Trích xuất Tags và Topics từ kết quả Posts (Tránh gọi API lỗi)
  const extractedResults = React.useMemo(() => {
    const posts = postsQuery.data?.posts || [];

    // Dùng Map để lọc trùng (Unique) theo ID
    const tagsMap = new Map();
    const topicsMap = new Map();

    posts.forEach((post) => {
      // Lấy Topic
      if (post.topic) {
        topicsMap.set(post.topic.topicId, post.topic);
      }
      // Lấy Tags
      post.tags?.forEach((tag) => {
        tagsMap.set(tag.tagId, tag);
      });
    });

    return {
      posts: posts.slice(0, 5), // Lấy 5 bài viết đầu
      tags: Array.from(tagsMap.values()).slice(0, 5), // Lấy 5 tag liên quan
      topics: Array.from(topicsMap.values()).slice(0, 5), // Lấy 5 chủ đề liên quan
    };
  }, [postsQuery.data]);

  return {
    results: extractedResults,
    mode: { isTagSearch, isUserSearch, isTopicSearch },
    isLoading: postsQuery.isLoading,
    isError: postsQuery.isError,
  };
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
