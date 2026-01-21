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

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  // 1. Lấy params từ URL - Đảm bảo key 'sort' khớp với AdminFilter gửi lên
  const urlParams = useMemo(
    () => ({
      status: searchParams.get("status") || "all",
      sort: searchParams.get("sort") || "new", // Đồng bộ với sortValue
      page: Number(searchParams.get("page")) || 1,
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      slug: searchParams.get("slug") || "",
    }),
    [searchParams],
  );

  // 2. Chuyển đổi để gọi API - Kiểm tra file mapper của bạn
  const apiParams = useMemo(
    () => mapTopicUrlParamsToApi(urlParams),
    [urlParams],
  );

  const { data, isFetching, error } = useAdminTopicsQuery(apiParams);

  // 3. Hàm cập nhật URL - Giữ nguyên vì đã xử lý Record<string, string | number | null> rất tốt
  const updateParams = useCallback(
    (next: Record<string, string | number | null>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value === null || value === "") sp.delete(key);
        else sp.set(key, String(value));
      });
      // Reset về page 1 khi thay đổi filter (trừ khi chính tham số thay đổi là page)
      if (!next.page) sp.set("page", "1");

      router.push(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [router, searchParams, pathname],
  );

  if (error)
    return (
      <div className="p-4 text-red-500">
        Lỗi tải dữ liệu. Vui lòng kiểm tra quyền Admin.
      </div>
    );

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
