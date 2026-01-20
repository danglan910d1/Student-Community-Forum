"use client";

import { TagApprovalCard } from "./TagApprovalCard";
import { ITag } from "../../types";
import { ITopic } from "@/modules/topic/types";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface TagApprovalSectionProps {
  tags: ITag[];
  topics: ITopic[];
  isFetching: boolean;
  isProcessing: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUpdateTopic: (tagId: string, topicId: string) => void;
}

export function TagApprovalSection({
  tags,
  topics,
  isFetching,
  isProcessing,
  onApprove,
  onReject,
  onUpdateTopic,
}: TagApprovalSectionProps) {
  const router = useRouter();

  // 1. Trạng thái đang tải dữ liệu lần đầu
  if (isFetching && tags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Đang tải danh sách chờ duyệt...</p>
      </div>
    );
  }

  // 2. Trạng thái hết sạch tag chờ duyệt (Empty State)
  if (tags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center p-6 bg-card border rounded-xl border-dashed">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-xl font-bold">Tất cả đã xong!</h3>
        <p className="text-muted-foreground mt-2 max-w-xs">
          Không còn thẻ nào đang chờ bạn phê duyệt lúc này.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại quản lý
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header của Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            Danh sách chờ duyệt
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {tags.length}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Kiểm tra tên thẻ và gán đúng chủ đề trước khi phê duyệt.
          </p>
        </div>

        <Button variant="link" size="sm" onClick={() => router.back()}>
          Quay lại trang chính
        </Button>
      </div>

      {/* Lưới các thẻ Card */}
      <div className="grid gap-4">
        {tags.map((tag) => (
          <TagApprovalCard
            key={tag.tagId}
            tag={tag}
            topics={topics}
            isProcessing={isProcessing}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </div>

      {/* Thông báo nhỏ ở dưới */}
      <p className="text-center text-xs text-muted-foreground py-4">
        Mẹo: Hành động Phê duyệt/Từ chối sẽ có hiệu lực ngay lập tức.
      </p>
    </div>
  );
}
