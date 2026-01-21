import { useQuery } from "@tanstack/react-query";
import { topicService } from "../services/topicService";

export function useTopicData(id: string | null) {
  return useQuery({
    queryKey: ["admin-topics", id],
    queryFn: () => (id ? topicService.getTopicById(id) : null),
    enabled: !!id, // Chỉ chạy khi có id
    staleTime: 5 * 60 * 1000,
  });
}
