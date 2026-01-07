// modules/tag/hooks/useTagsExplorer.ts
import { useQuery } from "@tanstack/react-query";
import { topicService } from "@/modules/topic/services/topicService";
import { tagService } from "../services/tagService";
import { ITag, TopicWithTags } from "../types";
import React from "react";

export function useTagsExplorer() {
  const topicsQuery = useQuery({
    queryKey: ["topics"],
    queryFn: topicService.getTopics,
    staleTime: 1000 * 60 * 30,
  });

  const allTagsQuery = useQuery({
    queryKey: ["tags", "all"],
    queryFn: () => tagService.getTags({ limit: 1000 }),
    staleTime: 1000 * 60 * 5,
  });

  // Hàm helper để trích xuất topicId từ field phức hợp của ITag
  const extractTopicId = (tag: ITag): string | null => {
    if (!tag.topic) return null;
    if (typeof tag.topic === "string") return tag.topic;
    return tag.topic.topicId;
  };

  const groupedData: TopicWithTags[] = React.useMemo(() => {
    if (!topicsQuery.data || !allTagsQuery.data) return [];

    const allTags = allTagsQuery.data.tags;

    return topicsQuery.data.map((topic) => ({
      ...topic,
      tags: allTags.filter((tag) => extractTopicId(tag) === topic.topicId),
    }));
  }, [topicsQuery.data, allTagsQuery.data]);

  return {
    allTags: allTagsQuery.data?.tags,
    data: groupedData,
    systemTags:
      allTagsQuery.data?.tags.filter((tag) => !extractTopicId(tag)) || [],
    isLoading: topicsQuery.isLoading || allTagsQuery.isLoading,
    isError: topicsQuery.isError || allTagsQuery.isError,
  };
}
