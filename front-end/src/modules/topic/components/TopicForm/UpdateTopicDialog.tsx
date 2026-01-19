"use client";

import * as React from "react";
import { BaseDialog } from "./DialogContent";
import { UpdateTopicContainer } from "../../containers/UpdateTopicContainer";

interface UpdateTopicDialogProps {
  topicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateTopicDialog({
  topicId,
  open,
  onOpenChange,
}: UpdateTopicDialogProps) {
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Chỉnh sửa chủ đề"
      description="Cập nhật thông tin chi tiết cho chủ đề này."
    >
      <UpdateTopicContainer
        topicId={topicId}
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </BaseDialog>
  );
}
