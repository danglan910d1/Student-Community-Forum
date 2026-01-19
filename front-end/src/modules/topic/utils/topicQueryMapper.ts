// modules/topic/utils/topicQueryMapper.ts
import { GlobalStatus } from "@/types/common";
import { IGetAdminTopicsParams } from "../types";

interface RawTopicParams {
  page?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const mapTopicUrlParamsToApi = (
  params: RawTopicParams,
): IGetAdminTopicsParams => {
  return {
    page: params.page || 1,
    limit: 10,
    // Admin View: "all" thì undefined để Backend lấy hết, còn lại ép kiểu
    status:
      params.status === "all" ? undefined : (params.status as GlobalStatus),
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
  };
};
