// modules/tag/containers/TagTableContainer.tsx
"use client";

import { useMemo, useCallback, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { mapTagUrlParamsToApi } from "../utils/tagQueryMapper";
import { useAdminTagsQuery } from "../hooks/useTagsQuery";
import { TagTableSection } from "../components/TagList/TagTableSection";
import { useTagStats } from "../hooks/useTagStats";

export function TagTableContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  const urlParams = useMemo(
    () => ({
      status: searchParams.get("status") || "all",
      sort: searchParams.get("sort") || "new",
      page: Number(searchParams.get("page")) || 1,
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      slug: searchParams.get("slug") || "",
    }),
    [searchParams],
  );

  const apiParams = useMemo(() => mapTagUrlParamsToApi(urlParams), [urlParams]);
  const { data, isFetching, error } = useAdminTagsQuery(apiParams);
  const { data: stats } = useTagStats();

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

  if (error)
    return (
      <div className="p-4 text-red-500">
        Lỗi tải dữ liệu. Vui lòng kiểm tra quyền Admin.
      </div>
    );

  return (
    <TagTableSection
      tags={data?.tags ?? []}
      params={urlParams}
      pagination={data?.pagination}
      isFetching={isFetching}
      onUpdateParams={updateParams}
      pendingCount={stats?.pendingCount ?? 0}
    />
  );
}
