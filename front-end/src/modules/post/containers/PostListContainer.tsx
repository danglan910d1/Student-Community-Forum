// modules/post/containers/PostListContainer.tsx
"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PAGINATION_CONFIG } from "@/constants/pagination";
import { usePostsQuery } from "../hooks/usePostsQuery";
import { useTopicStore } from "@/stores/useTopicStore";
import { PostSection } from "../components/PostList/PostSection";
import { mapUrlParamsToApi } from "../utils/postQueryMapper";

export function PostListContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { topics } = useTopicStore();

  const params = useMemo(
    () => ({
      topic: searchParams.get("topic"),
      tag: searchParams.get("tag"),
      sort: searchParams.get("sort") || "new",
      page: Number(searchParams.get("page")) || 1,
    }),
    [searchParams]
  );

  // Tái sử dụng helper (isMine = false)
  const apiParams = useMemo(() => mapUrlParamsToApi(params, false), [params]);

  const postsQuery = usePostsQuery({
    ...apiParams,
    limit: PAGINATION_CONFIG.postsPerPage,
    adminView: false,
  });

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

  const headerTitle = useMemo(() => {
    if (params.tag) return `Tag: #${params.tag.replace(/-/g, " ")}`;
    if (params.topic) {
      const topic = topics.find((t) => t.slug === params.topic);
      return topic ? topic.name : params.topic.replace(/-/g, " ");
    }
    return "Danh sách Bài viết";
  }, [params.tag, params.topic, topics]);

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
