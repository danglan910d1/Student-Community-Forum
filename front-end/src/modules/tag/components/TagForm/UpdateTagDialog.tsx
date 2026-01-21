"use client";

import * as React from "react";
import { BaseDialog } from "@/modules/topic/components/TopicForm/DialogContent";
import { UpdateTagContainer } from "../../containers/UpdateTagContainer";

interface UpdateTagDialogProps {
  tagId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateTagDialog({
  tagId,
  open,
  onOpenChange,
}: UpdateTagDialogProps) {
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Chỉnh sửa thẻ"
      description="Thay đổi thông tin hoặc gán lại chủ đề cho thẻ này."
    >
      <UpdateTagContainer
        tagId={tagId}
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </BaseDialog>
  );
}
