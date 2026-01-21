"use client";

import React from "react";
import { BaseDialog } from "@/modules/topic/components/TopicForm/DialogContent";
import { CreateTagContainer } from "../../containers/CreateTagContainer";
import { PlusCircle, ClipboardCheck } from "lucide-react"; // Thêm icon duyệt
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
interface CreateTagDialogProps {
  pendingCount?: number; // Truyền số lượng chờ duyệt vào để hiển thị badge
  onUpdateParams: (next: Record<string, string | number | null>) => void;
}

export function CreateTagDialog({ pendingCount = 0 }: CreateTagDialogProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      {/* NÚT DUYỆT NHANH: Thay vì mở page mới, ta dùng hàm onUpdateParams có sẵn 
          để lọc ngay tại bảng hiện tại sang trạng thái Pending */}
      {pendingCount > 0 && (
        <Button
          variant="outline"
          className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          onClick={() => router.push("/dashboard/admin/taxonomy/tag/approval")}
        >
          <ClipboardCheck className="mr-2 h-4 w-4" />
          <span>Đợi duyệt ({pendingCount})</span>
        </Button>
      )}

      <Button onClick={() => setOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        <span>New Tag</span>
      </Button>

      <BaseDialog
        open={open}
        onOpenChange={setOpen}
        title="Tạo thẻ (Tag) mới"
        description="Thêm các từ khóa để phân loại bài viết chi tiết hơn."
      >
        <CreateTagContainer
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </BaseDialog>
    </div>
  );
}
