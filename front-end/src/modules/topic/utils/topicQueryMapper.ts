// modules/topic/utils/topicQueryMapper.ts
import { GlobalStatus } from "@/types/common";
import { IGetAdminTopicsParams } from "../types";

interface RawTopicParams {
  page?: number | string; // Chấp nhận cả string từ URL
  status?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
  slug?: string;
}

export const mapTopicUrlParamsToApi = (
  params: RawTopicParams,
): IGetAdminTopicsParams => {
  return {
    // Chuyển page về number và đảm bảo slug không phải chuỗi rỗng khi gửi API
    page: Number(params.page) || 1,
    limit: 10,
    sort: params.sort || "new",
    status:
      params.status === "all" ? undefined : (params.status as GlobalStatus),
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
    slug: params.slug?.trim() || undefined, // Trim để tránh lỗi search toàn dấu cách
  };
};
