// modules/tag/hooks/useTagsData.ts
import * as React from "react";
import { useTagsExplorer } from "./useTagExplorer";
import { Tag } from "../types"; // Đảm bảo import interface UI ở trên

interface UseTagsDataProps {
  adminView?: boolean;
}

export function useTagsData({ adminView = false }: UseTagsDataProps = {}) {
  // query.data lúc này có kiểu TopicWithTags[] | undefined
  const query = useTagsExplorer({ adminView });

  // Helper function lấy tags theo Topic ID
  const getTagsByTopicId = React.useCallback(
    (topicId: string): Tag[] => {
      if (!topicId || !query.data) return [];

      // 1. Tìm group topic dựa trên topicId
      const topicGroup = query.data.find((t) => String(t.topicId) === topicId);

      if (!topicGroup || !topicGroup.tags) return [];

      // 2. CHUẨN HÓA: Ép kiểu dữ liệu thô (ITag) về dữ liệu UI (Tag)
      // Loại bỏ hoàn toàn các trường thừa như createdAt, updatedAt, user...
      return topicGroup.tags.map((tag) => ({
        // Backend có thể trả về tagId hoặc _id tùy vào việc đã qua transform chưa
        // Chúng ta lấy ưu tiên tagId, nếu không có thì lấy _id và ép về string
        tagId: String(tag.tagId || (tag as unknown as { _id: string })._id),
        name: tag.name,
        slug: tag.slug,
      }));
    },
    [query.data]
  );

  return {
    ...query,
    getTagsByTopicId,
  };
}
