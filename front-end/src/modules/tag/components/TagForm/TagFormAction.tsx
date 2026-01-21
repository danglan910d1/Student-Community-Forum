// modules/tag/components/TagForm/TagFormAction.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TagFormActionsProps {
  isPending: boolean;
  onCancel: () => void;
  submitText?: string;
  onCustomSubmit: () => void;
}

export function TagFormActions({
  isPending,
  onCancel,
  submitText = "Lưu thay đổi",
  onCustomSubmit,
}: TagFormActionsProps) {
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
        type="button"
        disabled={isPending}
        className="min-w-[100px]"
        onClick={(e) => {
          e.preventDefault();
          onCustomSubmit();
        }}
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : submitText}
      </Button>
    </div>
  );
}
