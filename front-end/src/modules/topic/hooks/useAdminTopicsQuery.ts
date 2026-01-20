import { useQuery } from "@tanstack/react-query";
import { topicService } from "../services/topicService";
import { IGetAdminTopicsParams } from "../types";

export const useAdminTopicsQuery = (params: IGetAdminTopicsParams) => {
  return useQuery({
    queryKey: [
      "admin",
      "topics",
      params.page,
      params.status,
      params.sort,
      params.slug,
    ],
    queryFn: () => topicService.getAdminTopics(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  });
};
