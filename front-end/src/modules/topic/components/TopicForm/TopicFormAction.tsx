"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TopicFormActionsProps {
  isPending: boolean;
  onCancel: () => void;
  submitText?: string;
  // Sửa thành bắt buộc hoặc xử lý mặc định bên dưới
  onCustomSubmit: () => void;
}

export function TopicFormActions({
  isPending,
  onCancel,
  submitText = "Lưu thay đổi",
  onCustomSubmit,
}: TopicFormActionsProps) {
  return (
    <div className="flex justify-end gap-3 mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isPending}
      >
        Hủy
      </Button>
      <Button
        type="button" // Dùng type button để tự kiểm soát validation
        disabled={isPending}
        className="min-w-[100px]"
        onClick={(e) => {
          e.preventDefault();
          onCustomSubmit(); // Chạy hàm trigger đã truyền từ container
        }}
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : submitText}
      </Button>
    </div>
  );
}
