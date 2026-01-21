// modules/post/components/DeletePostButton.tsx
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeletePost } from "../../hooks/useDeletePost";
import { ConfirmActionModal } from "@/components/shared/ConfirmActionModal";

interface DeletePostButtonProps {
  postId: string;
  className?: string;
  showText?: boolean;
}

export function DeletePostButton({
  postId,
  className,
  showText = true,
}: DeletePostButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useDeletePost();

  const handleConfirm = () => {
    mutate(postId, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <ConfirmActionModal
      open={open}
      onOpenChange={setOpen}
      title="Bạn chắc chắn chứ?"
      description="Hành động này không thể hoàn tác. Bài viết sẽ bị xóa mềm và chuyển vào thùng rác."
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
          {showText && <span>Xóa bài viết</span>}
        </div>
      }
    />
  );
}
