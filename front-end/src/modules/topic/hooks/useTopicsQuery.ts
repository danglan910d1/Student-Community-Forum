import { useQuery } from "@tanstack/react-query";
import { topicService } from "../services/topicService";

export const useTopicsQuery = () => {
  return useQuery({
    queryKey: ["topics"],
    queryFn: topicService.getTopics,
    // Vì danh sách Topic ít thay đổi, ta có thể để thời gian cache lâu một chút
    staleTime: 1000 * 60 * 30, // 30 phút
  });
};
