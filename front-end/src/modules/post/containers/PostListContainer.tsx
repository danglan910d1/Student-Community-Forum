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

  // 1. Đọc đầy đủ params từ URL
  const params = useMemo(
    () => ({
      topic: searchParams.get("topic") || undefined,
      tag: searchParams.get("tag") || undefined,
      sort: searchParams.get("sort") || "new", // Mặc định là 'new'
      page: Number(searchParams.get("page")) || 1,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    }),
    [searchParams],
  );

  // 2. Chuyển đổi sang API params (Đảm bảo mapper nhận startDate/endDate)
  const apiParams = useMemo(() => mapUrlParamsToApi(params, false), [params]);

  const postsQuery = usePostsQuery({
    ...apiParams,
    limit: PAGINATION_CONFIG.postsPerPage,
    adminView: false,
  });

  // 3. Hàm cập nhật URL không lỗi Type
  const updateParams = useCallback(
    (next: Record<string, string | number | null | undefined>) => {
      const sp = new URLSearchParams(searchParams.toString());

      Object.entries(next).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          sp.delete(key);
        } else {
          sp.set(key, String(value));
        }
      });

      // Reset về trang 1 nếu thay đổi filter (trừ khi chính tham số thay đổi là page)
      if (!next.hasOwnProperty("page")) {
        sp.set("page", "1");
      }

      router.push(`?${sp.toString()}`, { scroll: false });

      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [router, searchParams],
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
      params={params} // Truyền toàn bộ object params
      posts={postsQuery.data?.posts ?? []}
      pagination={postsQuery.data?.pagination}
      isFetching={postsQuery.isFetching}
      onUpdateParams={updateParams}
    />
  );
}
