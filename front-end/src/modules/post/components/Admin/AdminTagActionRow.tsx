"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { TagApprovalAction } from "../../types";
import { useComboboxAnchor } from "@/components/ui/combobox";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminTagActionRowProps {
  tag: { tagId: string; name: string; slug: string };
  onActionChange: (tagId: string, action: TagApprovalAction) => void;
  currentAction?: TagApprovalAction;
}

// Map label để hiển thị cho đẹp trên Button
const ACTION_LABELS: Record<TagApprovalAction, string> = {
  approve_and_add_topic: "Duyệt vào Topic & Gắn vào bài",
  approve_and_mark_free: "Duyệt thẻ Global & Gắn vào bài",
  approve_topic_and_reject_from_post: "Duyệt vào Topic (Không gắn bài)",
  approve_global_and_reject_from_post: "Duyệt thẻ Global (Không gắn bài)",
  reject_tag: "Từ chối hoàn toàn",
};

export function AdminTagActionRow({
  tag,
  onActionChange,
  currentAction,
}: AdminTagActionRowProps) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = useComboboxAnchor();

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
      <div className="flex flex-col">
        <span className="font-bold text-sm text-foreground">{tag.name}</span>
        <code className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded">
          slug: {tag.slug}
        </code>
      </div>

      <Combobox
        open={open}
        onOpenChange={setOpen}
        value={currentAction}
        onValueChange={(val) => {
          onActionChange(tag.tagId, val as TagApprovalAction);
          setOpen(false); // Đóng ngay sau khi chọn
        }}
      >
        {/* Nút bấm giả lập SelectTrigger nhưng dùng Anchor để cố định vị trí */}
        <div
          ref={anchorRef}
          onClick={() => setOpen(!open)}
          className={cn(
            "flex h-9 w-full sm:w-[280px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-[11px] font-bold uppercase shadow-sm cursor-pointer",
            "hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          )}
        >
          <span className="truncate text-sm">
            {currentAction
              ? ACTION_LABELS[currentAction]
              : "CHỌN CÁCH XỬ LÝ TAG..."}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
        </div>

        {/* Bảng chọn - Sử dụng Anchor để không bao giờ bị nhảy đi linh tinh */}
        <ComboboxContent anchor={anchorRef} className="w-[280px] p-0">
          <ComboboxList>
            <ComboboxItem value="approve_and_add_topic" className="text-sm">
              Duyệt vào Topic & Gắn vào bài
            </ComboboxItem>
            <ComboboxItem value="approve_and_mark_free" className="text-sm">
              Duyệt thẻ Global & Gắn vào bài
            </ComboboxItem>
            <div className="h-px bg-muted my-1" /> {/* Separator */}
            <ComboboxItem
              value="approve_topic_and_reject_from_post"
              className="text-sm italic text-orange-600"
            >
              Duyệt vào Topic (Không gắn bài)
            </ComboboxItem>
            <ComboboxItem
              value="approve_global_and_reject_from_post"
              className="text-sm italic text-orange-600"
            >
              Duyệt thẻ Global (Không gắn bài)
            </ComboboxItem>
            <div className="h-px bg-muted my-1" />
            <ComboboxItem
              value="reject_tag"
              className="text-sm font-bold text-destructive hover:bg-destructive/10"
            >
              Từ chối hoàn toàn (Xóa)
            </ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
