import { GlobalStatus } from "@/types/common";
import { IPost } from "../types";

interface RawParams {
  page?: number;
  sort?: string;
  status?: string;
  topic?: string | null;
  tag?: string | null;
}

export const mapUrlParamsToApi = (
  params: RawParams,
  isMine: boolean = false
) => {
  return {
    page: params.page || 1,
    // Nếu là trang của mình, ưu tiên lọc theo trạng thái duyệt bài
    // Nếu trang công khai, mặc định chỉ lấy bài đã duyệt
    status: isMine
      ? params.status !== "all"
        ? (params.status as GlobalStatus)
        : undefined
      : ("approved" as GlobalStatus),

    // Logic cho bộ lọc công khai (Mới nhất, Phổ biến, Đã giải quyết)
    is_resolved: params.sort === "resolved" ? true : undefined,
    sortBy: params.sort === "popular" ? "popular" : undefined,

    // Topic và Tag
    topicSlug: params.topic ?? undefined,
    tagSlug: params.tag ?? undefined,
  };
};

/**
 * Logic xác định đường dẫn chi tiết bài viết dựa trên vai trò và trạng thái
 */
export const getPostLink = (
  post: IPost,
  isAdminView: boolean,
  isMine: boolean
): string => {
  const isApproved = post.status === "approved";
  // 1. Trường hợp Admin
  if (isAdminView) {
    // Approved thì xem trực tiếp, còn lại vào page quản lý (Approve/Reject)
    return isApproved
      ? `/posts/${post.postId}/${post.slug}`
      : `/dashboard/admin/posts/${post.postId}`;
  }

  // 2. Trường hợp chủ bài viết hoặc Public
  // Chỉ khi đã approved mới được xem chi tiết, còn lại (pending/rejected) là đi sửa
  if (isMine && !isApproved) {
    return `/posts/${post.postId}/edit`;
  }

  return `/posts/${post.postId}/${post.slug}`;
};
