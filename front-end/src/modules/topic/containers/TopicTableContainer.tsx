// modules/topic/components/TopicList/TopicTableContainer.tsx
"use client";

import { useMemo, useCallback, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { mapTopicUrlParamsToApi } from "../utils/topicQueryMapper";
import { useAdminTopicsQuery } from "../hooks/useAdminTopicsQuery";
import { TopicTableSection } from "../components/TopicList/TopicTableSection";
import { useAuthStore } from "@/stores/useAuthStore";

export function TopicTableContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  // Kiểm tra quyền truy cập ở Client (Bảo vệ UI)
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/"); // Redirect nếu không phải admin
    }
  }, [user, router]);

  const urlParams = useMemo(
    () => ({
      status: searchParams.get("status") || "all",
      sort: searchParams.get("sort") || "new",
      page: Number(searchParams.get("page")) || 1,
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
    }),
    [searchParams],
  );

  const apiParams = useMemo(
    () => mapTopicUrlParamsToApi(urlParams),
    [urlParams],
  );

  // Hook này sẽ tự động gửi kèm Token trong Header nhờ Axios Interceptor
  const { data, isFetching, error } = useAdminTopicsQuery(apiParams);

  // Debug để kiểm tra cấu trúc dữ liệu mới
  useEffect(() => {
    if (data) {
      console.log("Admin Topics Data:", data.topics);
      // Bạn sẽ thấy topics[0]._count.posts ở đây
    }
  }, [data]);

  const updateParams = useCallback(
    (next: Record<string, string | number | null>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value === null || value === "") sp.delete(key);
        else sp.set(key, String(value));
      });
      if (!next.page) sp.set("page", "1");
      router.push(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [router, searchParams, pathname],
  );

  if (error) return <div>Lỗi tải dữ liệu. Vui lòng kiểm tra quyền Admin.</div>;

  return (
    <TopicTableSection
      topics={data?.topics ?? []}
      params={urlParams}
      pagination={data?.pagination}
      isFetching={isFetching}
      onUpdateParams={updateParams}
    />
  );
}
