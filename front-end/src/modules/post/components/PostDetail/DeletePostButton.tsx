// modules/post/components/DeletePostButton.tsx
"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeletePost } from "../../hooks/useDeletePost";

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

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn chặn dropdown đóng lại ngay lập tức
    mutate(postId, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <>
      {/* Nút giả để trigger mở Modal - Dùng div hoặc span để tránh lỗi lồng Button */}
      <div
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center w-full px-2 py-1.5 text-sm text-red-600 cursor-pointer hover:bg-red-50 rounded-sm transition-colors",
          className
        )}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {showText && <span>Xóa bài viết</span>}
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn chắc chắn chứ?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bài viết sẽ bị xóa mềm và chuyển
              vào thùng rác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isPending}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
