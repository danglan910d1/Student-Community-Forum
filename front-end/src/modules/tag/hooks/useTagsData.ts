// modules/tag/hooks/useTagsData.ts
import * as React from "react";
import { useTagsExplorer } from "./useTagExplorer";

interface UseTagsDataProps {
  adminView?: boolean;
}

export function useTagsData({ adminView = false }: UseTagsDataProps = {}) {
  const query = useTagsExplorer({ adminView });

  // Helper function lấy tags theo Topic ID
  const getTagsByTopicId = React.useCallback(
    (topicId: string) => {
      if (!topicId) return []; // Nếu chưa chọn topic thì chưa hiện topicTags
      return query.data.find((t) => t.topicId === topicId)?.tags || [];
    },
    [query.data]
  );

  return {
    ...query,
    getTagsByTopicId,
  };
}
