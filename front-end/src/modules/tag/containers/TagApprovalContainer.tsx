"use client";

import { useAdminTagsQuery } from "../hooks/useTagsQuery";
import { useAdminTopicsQuery } from "@/modules/topic/hooks/useAdminTopicsQuery";
import { useUpdateTag } from "../hooks/useUpdateTag";
import { ICreateTagBody } from "../types";
import { TagApprovalSection } from "../components/TagApproval/TagApprovalSection";

export function TagApprovalContainer() {
  // 1. Lấy danh sách Tag đang chờ duyệt
  const {
    data: tagsData,
    isFetching,
    refetch,
  } = useAdminTagsQuery({
    status: "pending",
    limit: 100,
  });

  // 2. Lấy danh sách Topic
  const { data: topicsData } = useAdminTopicsQuery({ status: "approved" });

  // 3. Hook update
  const { mutate: updateTag, isPending: isUpdating } = useUpdateTag();

  // Hàm xử lý chung với Type chuẩn
  const handleAction = (tagId: string, body: Partial<ICreateTagBody>) => {
    updateTag(
      { id: tagId, body },
      {
        onSuccess: () => {
          // Sau khi update thành công (duyệt/từ chối), refetch để tag đó biến mất khỏi list pending
          refetch();
        },
      },
    );
  };

  return (
    <TagApprovalSection
      tags={tagsData?.tags ?? []}
      topics={topicsData?.topics ?? []}
      isFetching={isFetching}
      isProcessing={isUpdating}
      onApprove={(id) => handleAction(id, { status: "approved" })}
      onReject={(id) => handleAction(id, { status: "rejected" })}
      onUpdateTopic={(id, topicId) => handleAction(id, { topicId })}
    />
  );
}
