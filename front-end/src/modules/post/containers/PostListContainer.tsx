// modules/post/containers/PostListContainer.tsx
"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PAGINATION_CONFIG } from "@/constants/pagination";
import { usePostsQuery } from "../hooks/usePostsQuery";
import { useTopicStore } from "@/stores/useTopicStore";
import { PostSection } from "../components/PostList/PostSection";

export function PostListContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { topics } = useTopicStore();

  // 1. Memoize params từ URL
  const params = useMemo(() => {
    return {
      topic: searchParams.get("topic"),
      tag: searchParams.get("tag"),
      sort: searchParams.get("sort") || "new",
      page: Number(searchParams.get("page")) || 1,
    };
  }, [searchParams]);

  // 2. Fetch data với queryType để phân biệt trang
  const postsQuery = usePostsQuery({
    page: params.page,
    limit: PAGINATION_CONFIG.postsPerPage,
    topicSlug: params.topic ?? undefined,
    tagSlug: params.tag ?? undefined,
    is_resolved: params.sort === "resolved" ? true : undefined,
    sortBy: params.sort === "popular" ? "popular" : undefined,
  });

  // 🔹 Log state query để debug
  console.log("[PostListContainer] postsQuery:", {
    data: postsQuery.data,
    isLoading: postsQuery.isLoading,
    isFetching: postsQuery.isFetching,
    params,
  });

  // 3. Xử lý update URL
  const updateParams = useCallback(
    (next: Record<string, string | number | null>) => {
      const sp = new URLSearchParams(searchParams.toString());

      Object.entries(next).forEach(([key, value]) => {
        if (value === null) sp.delete(key);
        else sp.set(key, String(value));
      });

      router.push(`?${sp.toString()}`, { scroll: false });

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, searchParams]
  );

  // 4. Logic tiêu đề Header
  const headerTitle = useMemo(() => {
    if (params.tag) return `Tag: #${params.tag.replace(/-/g, " ")}`;

    if (params.topic) {
      const topic = topics.find((t) => t.slug === params.topic);
      return topic ? topic.name : params.topic.replace(/-/g, " ");
    }

    return "Danh sách Bài viết";
  }, [params.tag, params.topic, topics]);

  // const isInitialLoading = postsQuery.isLoading && !postsQuery.data;
  // const showPageSkeleton = useMinimumLoading(isInitialLoading, 300);

  // if (showPageSkeleton) return <ContentPageSkeleton />;

  return (
    <PostSection
      headerTitle={headerTitle}
      params={{ page: params.page, sort: params.sort }}
      posts={postsQuery.data?.posts ?? []}
      pagination={postsQuery.data?.pagination}
      isFetching={postsQuery.isFetching}
      onUpdateParams={updateParams}
    />
  );
}
