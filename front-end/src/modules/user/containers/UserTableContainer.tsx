"use client";

import { useMemo, useCallback, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/useAuthStore";
import { mapUserUrlParamsToApi } from "../utils/userQueryMapper";
import { useAdminUsers } from "../hooks/useAdminUser";
import { UserTableSection } from "../components/UserList/UserTableSection";

export function UserTableContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  // Kiểm tra quyền Admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  // 1. Lấy dữ liệu thô từ URL
  const urlParams = useMemo(
    () => ({
      status: searchParams.get("status") || "all",
      role: searchParams.get("role") || "all",
      page: Number(searchParams.get("page")) || 1,
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      email: searchParams.get("email") || "",
    }),
    [searchParams],
  );

  // 2. Map sang API Params
  const apiParams = useMemo(
    () => mapUserUrlParamsToApi(urlParams),
    [urlParams],
  );

  // 3. Gọi hook lấy data
  const { data, isFetching, error } = useAdminUsers(apiParams);

  // 4. Hàm cập nhật URL
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
      <div className="p-10 text-center text-red-500 font-medium">
        Đã có lỗi xảy ra khi tải danh sách người dùng.
      </div>
    );

  return (
    <UserTableSection
      users={data?.users ?? []}
      params={urlParams}
      pagination={data?.pagination}
      isFetching={isFetching}
      onUpdateParams={updateParams}
    />
  );
}
