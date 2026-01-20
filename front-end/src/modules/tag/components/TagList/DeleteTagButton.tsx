// modules/tag/components/TagList/DeleteTagButton.tsx
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmActionModal } from "@/components/shared/ConfirmActionModal";
import { useDeleteTag } from "../../hooks/useDeleteTag";

interface DeleteTagButtonProps {
  tagId: string;
  tagName?: string;
  className?: string;
  showText?: boolean;
}

export function DeleteTagButton({
  tagId,
  tagName,
  className,
  showText = true,
}: DeleteTagButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useDeleteTag();

  const handleConfirm = () => {
    mutate(tagId, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <ConfirmActionModal
      open={open}
      onOpenChange={setOpen}
      title="Xóa thẻ (Tag) này?"
      description={`Bạn đang chuẩn bị xóa thẻ "#${tagName}". Thẻ này sẽ bị gỡ khỏi các bài viết liên quan và chuyển vào thùng rác.`}
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
          {showText && <span>Xóa thẻ</span>}
        </div>
      }
    />
  );
}
