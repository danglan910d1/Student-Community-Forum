"use client";

import React, { useState } from "react";
import { Check, X, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ITag } from "../../types";
import { ITopic } from "@/modules/topic/types";
import { cn } from "@/lib/utils";
// Import Component hiển thị thuần túy (không chứa logic Form)
import { TopicSelectDisplay } from "@/modules/topic/components/TopicForm/SimpleTopicSelect";

interface TagApprovalCardProps {
  tag: ITag;
  topics: ITopic[];
  onApprove: (id: string, topicId: string) => void;
  onReject: (id: string) => void;
  isProcessing?: boolean;
}

export function TagApprovalCard({
  tag,
  topics,
  onApprove,
  onReject,
  isProcessing = false,
}: TagApprovalCardProps) {
  // Lấy topicId hiện tại (xử lý cả trường hợp topic là object hoặc string)
  const currentTopicId =
    typeof tag.topic === "object" ? tag.topic?.topicId : tag.topic;
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    currentTopicId || "",
  );

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-center justify-between p-5 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all gap-6",
        isProcessing && "opacity-60 pointer-events-none",
      )}
    >
      {/* 1. Phần thông tin Tag */}
      <div className="flex items-center gap-4 flex-1 w-full">
        <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
          <TagIcon className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-lg truncate" title={tag.name}>
            {tag.name}
          </h3>
          <p className="text-xs text-muted-foreground font-mono truncate">
            slug: {tag.slug}
          </p>
        </div>
      </div>

      {/* 2. Phần thay đổi Topic trực tiếp - Sử dụng Display Component đã tách */}
      <div className="w-full md:w-72">
        <TopicSelectDisplay
          label="Gán vào chủ đề"
          topics={topics}
          value={selectedTopicId}
          onChange={(newId) => setSelectedTopicId(newId)}
          disabled={isProcessing}
          allowSystemTag={true}
          placeholder="Chọn chủ đề chính..."
        />
      </div>

      {/* 3. Nhóm hành động quyết định */}
      <div className="flex items-center gap-3 w-full md:w-auto md:border-l md:pl-6 pt-4 md:pt-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 md:flex-none text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={() => onReject(tag.tagId)}
          disabled={isProcessing}
        >
          <X className="w-4 h-4 mr-2" />
          Từ chối
        </Button>
        <Button
          size="sm"
          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white shadow-sm transition-colors"
          onClick={() => {
            // Khi nhấn Approve, gửi cả topicId đang được chọn trong state
            onApprove(tag.tagId, selectedTopicId);
          }}
          disabled={isProcessing}
        >
          <Check className="w-4 h-4 mr-2" />
          Phê duyệt
        </Button>
      </div>
    </div>
  );
}
