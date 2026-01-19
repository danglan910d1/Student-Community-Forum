import { useQuery } from "@tanstack/react-query";
import { topicService } from "../services/topicService";
import { IGetAdminTopicsParams } from "../types";

export const useAdminTopicsQuery = (params: IGetAdminTopicsParams) => {
  return useQuery({
    queryKey: ["admin-topics", params],
    queryFn: () => topicService.getAdminTopics(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5, // 5 phút cho dữ liệu Admin
  });
};
