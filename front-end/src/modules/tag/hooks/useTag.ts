// modules/tag/hooks/useTags.ts
import { useQuery } from "@tanstack/react-query";
import { tagService } from "../services/tagService";

export function useTags(topicId?: string) {
  // Fetch Tags theo Topic
  const topicTagsQuery = useQuery({
    queryKey: ["tags", "topic", topicId],
    queryFn: () => tagService.getTags({ topicId }),
    enabled: !!topicId,
  });

  // Fetch Tags hệ thống
  const systemTagsQuery = useQuery({
    queryKey: ["tags", "system"],
    queryFn: () => tagService.getTags({ topicId: "" }),
  });

  const allTagsQuery = useQuery({
    queryKey: ["tags", "all"],
    queryFn: () => tagService.getTags({}), // Giả định API trả về tất cả nếu để trống
  });

  return {
    allTags: allTagsQuery.data?.tags || [],
    topicTags: topicTagsQuery.data?.tags || [],
    systemTags: systemTagsQuery.data?.tags || [],
    isLoading: topicTagsQuery.isLoading || systemTagsQuery.isLoading,
  };
}
