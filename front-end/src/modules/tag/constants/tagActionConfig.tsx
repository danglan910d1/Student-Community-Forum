// modules/tag/constants/tagActionConfigs.tsx
import { Pencil, Eye, CheckCircle, XCircle } from "lucide-react";
import { ITag } from "../types";
import { ActionItemConfig } from "@/types/actionMenu";
import { DeleteTagButton } from "../components/TagList/DeleteTagButton";

export const TAG_ACTION_TYPES = {
  ADMIN: (tag: ITag): ActionItemConfig[][] => {
    const groups: ActionItemConfig[][] = [
      [
        {
          label: "Xem bài viết",
          icon: Eye,
          href: `/posts?tag=${tag.slug}`,
        },
        {
          label: "Chỉnh sửa thẻ",
          icon: Pencil,
        },
      ],
    ];

    // Thêm nhóm Duyệt/Từ chối nếu tag đang chờ duyệt
    if (tag.status === "pending") {
      groups.push([
        {
          label: "Duyệt thẻ",
          icon: CheckCircle,
          className: "text-green-600",
        },
        {
          label: "Từ chối thẻ",
          icon: XCircle,
          className: "text-orange-600",
        },
      ]);
    }

    // Nhóm hành động xóa
    groups.push([
      {
        component: <DeleteTagButton tagId={tag.tagId} tagName={tag.name} />,
        variant: "destructive",
      },
    ]);

    return groups;
  },
};
