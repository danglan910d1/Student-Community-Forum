// modules/tag/hooks/useTagActions.ts
"use client";

import { useRouter } from "next/navigation";
import { ITag } from "../types";
import { ActionItemConfig } from "@/types/actionMenu";
import { TAG_ACTION_TYPES } from "../constants/tagActionConfig";
import { useUpdateTag } from "../hooks/useUpdateTag"; // Sử dụng hook update đơn lẻ

interface ActionCallbacks {
  onEdit?: () => void;
  onDelete?: () => void;
}

export function useTagActions(tag: ITag, callbacks?: ActionCallbacks) {
  const router = useRouter();
  const { mutate: updateTag } = useUpdateTag();

  const prepare = (groups: ActionItemConfig[][]): ActionItemConfig[][] =>
    groups.map((group) =>
      group.map((item) => {
        let finalOnClick = item.onClick;

        // 1. Chuyển trang nếu có href
        if (item.href) {
          finalOnClick = () => router.push(item.href as string);
        }

        // 2. Logic Chỉnh sửa (Mở Modal/Dialog)
        if (item.label === "Chỉnh sửa thẻ" && callbacks?.onEdit) {
          finalOnClick = callbacks.onEdit;
        }

        // 3. Cập nhật trạng thái nhanh (Sử dụng updateTag đơn lẻ)
        if (item.label === "Duyệt thẻ") {
          finalOnClick = () =>
            updateTag({
              id: tag.tagId,
              body: { status: "approved" },
            });
        }

        if (item.label === "Từ chối thẻ") {
          finalOnClick = () =>
            updateTag({
              id: tag.tagId,
              body: { status: "rejected" },
            });
        }

        return {
          ...item,
          show: item.show ?? true,
          onClick: finalOnClick,
        };
      }),
    );

  return {
    adminActions: prepare(TAG_ACTION_TYPES.ADMIN(tag)),
  };
}
