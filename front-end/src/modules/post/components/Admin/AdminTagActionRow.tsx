"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagApprovalAction } from "../../types";

interface AdminTagActionRowProps {
  tag: { tagId: string; name: string; slug: string };
  onActionChange: (tagId: string, action: TagApprovalAction) => void;
  currentAction?: TagApprovalAction;
}

export function AdminTagActionRow({
  tag,
  onActionChange,
  currentAction,
}: AdminTagActionRowProps) {
  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
      <div className="flex flex-col">
        <span className="font-bold text-sm">{tag.name}</span>
        <code className="text-[10px] text-muted-foreground font-mono">
          Slug: {tag.slug}
        </code>
      </div>

      <Select
        value={currentAction}
        onValueChange={(val) =>
          onActionChange(tag.tagId, val as TagApprovalAction)
        }
      >
        <SelectTrigger className="w-full sm:w-[240px] h-9 text-xs font-medium uppercase tracking-tight">
          <SelectValue placeholder="Chọn hành động..." />
        </SelectTrigger>
        <SelectContent align="end">
          {/* <SelectItem value="approve_post_only">Duyệt cho bài viết</SelectItem> */}
          <SelectItem value="approve_and_add_topic">
            Duyệt & Lưu vào Topic
          </SelectItem>
          <SelectItem value="approve_and_mark_free">
            Duyệt & Lưu Thẻ chung
          </SelectItem>
          <SelectItem value="reject_tag_from_post" className="text-destructive">
            Từ chối (Gỡ khỏi bài)
          </SelectItem>
          <SelectItem
            value="approve_topic_and_reject_from_post"
            className="text-xs italic"
          >
            Chỉ lưu Topic
          </SelectItem>
          <SelectItem
            value="approve_global_and_reject_from_post"
            className="text-xs italic"
          >
            Chỉ lưu Thẻ chung
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
