// modules/topic/components/TopicList/DeleteTopicButton.tsx
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmActionModal } from "@/components/shared/ConfirmActionModal";
import { useDeleteTopic } from "./hooks/useDeleteTopic";

interface DeleteTopicButtonProps {
  topicId: string;
  topicName?: string;
  className?: string;
  showText?: boolean;
}

export function DeleteTopicButton({
  topicId,
  topicName,
  className,
  showText = true,
}: DeleteTopicButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useDeleteTopic();

  const handleConfirm = () => {
    mutate(topicId, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <ConfirmActionModal
      open={open}
      onOpenChange={setOpen}
      title="Xóa chủ đề bài viết?"
      description={`Bạn đang chuẩn bị xóa chủ đề "${topicName}". Hành động này có thể ảnh hưởng đến các bài viết đang thuộc chủ đề này.`}
      confirmLabel="Xác nhận xóa"
      variant="destructive"
      isLoading={isPending}
      onConfirm={handleConfirm}
      trigger={
        <div
          className={cn(
            "flex items-center w-full px-2 py-1.5 text-sm text-red-600 cursor-pointer hover:bg-red-50 rounded-sm transition-colors",
            className,
          )}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {showText && <span>Xóa chủ đề</span>}
        </div>
      }
    />
  );
}
