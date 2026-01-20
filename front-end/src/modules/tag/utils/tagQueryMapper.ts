// modules/tag/utils/tagQueryMapper.ts
import { GlobalStatus } from "@/types/common";
import { IGetAdminTagsParams, ITag } from "../types";

interface RawTagParams {
  page?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
  slug?: string;
}

export const mapTagUrlParamsToApi = (
  params: RawTagParams,
): IGetAdminTagsParams => {
  return {
    page: params.page || 1,
    limit: 10,
    sort: params.sort || "new",
    // Trạng thái: "all" thì để undefined để lấy hết
    status:
      params.status === "all" ? undefined : (params.status as GlobalStatus),
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
    slug: params.slug,
  };
};

/**
 * Logic xác định đường dẫn cho Tag dựa trên trạng thái kiểm duyệt
 */
export const getTagLink = (tag: ITag): string => {
  const isApproved = tag.status === "approved";

  // 1. Nếu đã duyệt: Cho phép xem danh sách bài viết công khai có gắn tag này
  if (isApproved) {
    return `/posts?tag=${tag.slug}`;
  }

  // 2. Nếu chưa duyệt hoặc bị từ chối: Dẫn vào trang quản trị để chỉnh sửa/kiểm duyệt
  return `/dashboard/admin/taxonomy/tag/${tag.tagId}`;
};
