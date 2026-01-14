// modules/post/containers/MyPostsContainer.tsx
"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePostsQuery } from "../hooks/usePostsQuery";
import { PostTableSection } from "../components/PostList/PostTableSection";
import { GlobalStatus } from "@/types/common";

export function PostTableContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => ({
      status: searchParams.get("status") || "all",
      page: Number(searchParams.get("page")) || 1,
    }),
    [searchParams]
  );

  const postsQuery = usePostsQuery({
    page: params.page,
    limit: 10,
    myPosts: true, // Lấy bài viết của chính mình
    status:
      params.status !== "all" ? (params.status as GlobalStatus) : undefined,
  });

  const updateParams = useCallback(
    (next: Record<string, string | number | null>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value === null) sp.delete(key);
        else sp.set(key, String(value));
      });
      router.push(`?${sp.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <PostTableSection
      posts={postsQuery.data?.posts ?? []}
      params={params}
      pagination={postsQuery.data?.pagination}
      isFetching={postsQuery.isFetching}
      onUpdateParams={updateParams}
    />
  );
}
