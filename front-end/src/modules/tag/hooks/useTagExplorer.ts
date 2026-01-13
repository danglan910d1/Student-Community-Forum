// modules/tag/hooks/useTagsExplorer.ts
import { useQuery } from "@tanstack/react-query";
import { topicService } from "@/modules/topic/services/topicService";
import { tagService } from "../services/tagService";
import { ITag, TopicWithTags } from "../types";
import * as React from "react";
import { AxiosError } from "axios";

interface UseTagsExplorerProps {
  adminView?: boolean;
}

export function useTagsExplorer({
  adminView = false,
}: UseTagsExplorerProps = {}) {
  // 1. Fetch danh sách Topics
  const topicsQuery = useQuery({
    queryKey: ["topics", adminView],
    queryFn: topicService.getTopics,
    staleTime: 1000 * 60 * 30, // 30 phút vì topic ít thay đổi
  });

  // 2. Fetch toàn bộ Tags (limit cao để gom nhóm tại client)
  const allTagsQuery = useQuery({
    queryKey: ["tags", "explorer", adminView],
    queryFn: () =>
      tagService.getTags({
        limit: 1000,
        adminView,
      }),
    staleTime: 1000 * 60 * 5, // 5 phút
    gcTime: 1000 * 60 * 10,
  });

  // Helper trích xuất ID từ field topic (string hoặc object)
  const extractTopicId = React.useCallback((tag: ITag): string | null => {
    if (!tag.topic) return null;
    if (typeof tag.topic === "string") return tag.topic;
    return tag.topic.topicId;
  }, []);

  // 3. Logic gom nhóm dữ liệu O(n)
  const result = React.useMemo(() => {
    if (!topicsQuery.data || !allTagsQuery.data) {
      return { groupedData: [], systemTags: [] };
    }

    const allTags = allTagsQuery.data.tags;
    const tagsByTopicMap = new Map<string, ITag[]>();
    const systemTags: ITag[] = [];

    // Phân loại tags vào Map
    allTags.forEach((tag) => {
      const tId = extractTopicId(tag);
      if (tId) {
        if (!tagsByTopicMap.has(tId)) {
          tagsByTopicMap.set(tId, []);
        }
        tagsByTopicMap.get(tId)?.push(tag);
      } else {
        systemTags.push(tag);
      }
    });

    // Tạo mảng Topic đã kèm Tags
    const groupedData: TopicWithTags[] = topicsQuery.data.map((topic) => ({
      ...topic,
      tags: tagsByTopicMap.get(topic.topicId) || [],
    }));

    return { groupedData, systemTags };
  }, [topicsQuery.data, allTagsQuery.data, extractTopicId]);

  return {
    data: result.groupedData,
    allTags: allTagsQuery.data?.tags || [],
    systemTags: result.systemTags,
    isLoading: topicsQuery.isLoading || allTagsQuery.isLoading,
    isError: topicsQuery.isError || allTagsQuery.isError,
    isFetching: topicsQuery.isFetching || allTagsQuery.isFetching,
    error: (topicsQuery.error || allTagsQuery.error) as AxiosError,
  };
}
