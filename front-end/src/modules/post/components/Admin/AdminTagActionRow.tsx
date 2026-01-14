// modules/post/components/Admin/AdminTagActionRow.tsx
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
}

export function AdminTagActionRow({
  tag,
  onActionChange,
}: AdminTagActionRowProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{tag.name}</span>
        <span className="text-xs text-muted-foreground italic">
          slug: {tag.slug}
        </span>
      </div>

      <Select
        onValueChange={(val) =>
          onActionChange(tag.tagId, val as TagApprovalAction)
        }
      >
        <SelectTrigger className="w-[260px] bg-slate-50">
          <SelectValue placeholder="Chọn hành động cho thẻ này..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="approve_post_only"
            className="text-blue-600 font-medium"
          >
            Duyệt cho bài viết này
          </SelectItem>
          <SelectItem value="approve_and_add_topic">
            Duyệt bài & Lưu vào Topic
          </SelectItem>
          <SelectItem value="approve_and_mark_free">
            Duyệt bài & Lưu làm Thẻ chung
          </SelectItem>
          <SelectItem value="reject_tag_from_post" className="text-red-500">
            Từ chối (Gỡ khỏi bài)
          </SelectItem>
          <SelectItem value="approve_topic_and_reject_from_post">
            Chỉ lưu vào Topic (Không gắn bài)
          </SelectItem>
          <SelectItem value="approve_global_and_reject_from_post">
            Chỉ lưu làm Thẻ chung (Không gắn bài)
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
