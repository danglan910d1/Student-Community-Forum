"use client";

import { useCallback, useMemo } from "react";
import {
  useRouter,
  useSearchParams,
  useParams,
  usePathname,
} from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePostsQuery } from "../hooks/usePostsQuery";
import { PostTableSection } from "../components/PostList/PostTableSection";
import { mapUrlParamsToApi } from "../utils/postQueryMapper";
import { GlobalStatus } from "@/types/common";

interface PostApiParams {
  status?: GlobalStatus;
  sort?: string;
  page?: number;
  limit?: number;
  myPosts?: boolean;
  adminView?: boolean;
  userId?: string;
  [key: string]: string | number | boolean | undefined;
}

export function PostTableContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const routeParams = useParams();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuthStore();

  // 1. Xác định ngữ cảnh
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdminView = useMemo(() => {
    const isRoleAdmin = currentUser?.role?.toLowerCase() === "admin";
    const isInAdminRoute = pathname.startsWith("/dashboard/admin");
    return !!(isRoleAdmin && isInAdminRoute);
  }, [currentUser?.role, pathname]);

  const targetUserId = routeParams.id as string;

  // 2. Quyền sở hữu (isMine)
  const isMine = useMemo(() => {
    if (isAdminView) return false;
    if (isDashboard) return true;
    return !!(currentUser?.userId && targetUserId === currentUser?.userId);
  }, [isAdminView, isDashboard, targetUserId, currentUser?.userId]);

  // 3. Đọc params từ URL
  const urlParams = useMemo(
    () => ({
      status: searchParams.get("status") || "all",
      sort: searchParams.get("sort") || "new",
      page: Number(searchParams.get("page")) || 1,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    }),
    [searchParams],
  );

  // 4. Xây dựng API Params sạch (đây là "Key" để React Query tự động refetch)
  const cleanApiParams = useMemo(() => {
    const base = mapUrlParamsToApi(urlParams, isMine);

    const params: PostApiParams = {
      ...base,
      limit: 10,
      adminView: isAdminView ? true : undefined,
    };

    if (isAdminView) {
      // Logic Admin: 'all' thì không gửi status để lấy tất cả
      params.status = (
        urlParams.status === "all" ? undefined : urlParams.status
      ) as GlobalStatus;
      params.myPosts = undefined;
    } else if (isDashboard) {
      // Logic Dashboard cá nhân
      params.myPosts = true;
      params.userId = undefined;
    } else if (targetUserId) {
      // Logic Profile công khai
      params.userId = targetUserId;
      params.status = "approved" as GlobalStatus;
      params.myPosts = undefined;
    }

    // Loại bỏ các giá trị null/undefined để Query Key luôn chuẩn
    return Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null),
    ) as PostApiParams;
  }, [urlParams, isMine, isAdminView, isDashboard, targetUserId]);

  // 5. FETCH DỮ LIỆU (Tự động chạy lại khi cleanApiParams thay đổi)
  const postsQuery = usePostsQuery(cleanApiParams);

  // 6. Hàm cập nhật URL đồng nhất với PostList
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

      router.push(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [router, searchParams, pathname],
  );

  return (
    <PostTableSection
      posts={postsQuery.data?.posts ?? []}
      params={urlParams}
      pagination={postsQuery.data?.pagination}
      isFetching={postsQuery.isFetching}
      onUpdateParams={updateParams}
      isMine={isDashboard && isMine}
      isAdminView={isAdminView}
    />
  );
}
