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

  // 1. Xác định ngữ cảnh Dashboard
  const isDashboard = pathname.startsWith("/dashboard");

  // 2. Xác định chế độ Admin
  const isAdminView = useMemo(() => {
    const isRoleAdmin = currentUser?.role?.toLowerCase() === "admin";
    const isInAdminRoute = pathname.startsWith("/dashboard/admin");
    return !!(isRoleAdmin && isInAdminRoute);
  }, [currentUser?.role, pathname]);

  // 3. Quyền sở hữu (isMine)
  // - Admin: false
  // - Dashboard: true (mặc định quản lý bài của mình)
  // - Profile công khai: true nếu ID trong URL trùng với ID bản thân
  const targetUserId = routeParams.id as string;
  const isMine = useMemo(() => {
    if (isAdminView) return false;
    if (isDashboard) return true;
    return !!(currentUser?.userId && targetUserId === currentUser?.userId);
  }, [isAdminView, isDashboard, targetUserId, currentUser?.userId]);

  // 4. Lấy params từ URL
  const urlParams = useMemo(
    () => ({
      status: searchParams.get("status") || "all",
      sort: searchParams.get("sort") || "new",
      page: Number(searchParams.get("page")) || 1,
    }),
    [searchParams]
  );

  // 5. Xây dựng API Params sạch
  const cleanApiParams = useMemo(() => {
    // mapUrlParamsToApi sẽ dựa vào isMine để quyết định có gửi status/myPosts mặc định không
    const base = mapUrlParamsToApi(urlParams, isMine);

    const params: PostApiParams = {
      ...base,
      limit: 10,
      adminView: isAdminView ? true : undefined,
    };

    if (isAdminView) {
      params.status = (
        urlParams.status === "all" ? undefined : urlParams.status
      ) as GlobalStatus;
    }
    // TRƯỜNG HỢP DASHBOARD: Ưu tiên dùng myPosts để lấy toàn bộ bài (nháp/duyệt/từ chối)
    else if (isDashboard) {
      params.myPosts = true;
      params.userId = undefined;
    }
    // TRƯỜNG HỢP PROFILE CÔNG KHAI: Dùng userId (kể cả khi tự xem chính mình)
    else if (targetUserId) {
      params.userId = targetUserId;
      params.status = "approved" as GlobalStatus; // Chỉ xem bài đã duyệt công khai
      params.myPosts = undefined;
    }

    // Lọc bỏ undefined/null
    const finalParams: PostApiParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        finalParams[key] = params[key];
      }
    });

    return finalParams;
  }, [urlParams, isMine, isAdminView, isDashboard, targetUserId]);

  // 6. Fetch dữ liệu
  const postsQuery = usePostsQuery(cleanApiParams);

  // 7. Cập nhật URL (Pagination & Filter)
  const updateParams = useCallback(
    (next: Record<string, string | number | null>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value === null) sp.delete(key);
        else sp.set(key, String(value));
      });
      router.push(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [router, searchParams, pathname]
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
