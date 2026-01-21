"use client";

import { useRouter } from "next/navigation";
import { ITopic } from "../types";
import { ActionItemConfig } from "@/types/actionMenu";
import { TOPIC_ACTION_TYPES } from "../constants/topicActionConfig";

// Thêm interface này để định nghĩa các hàm xử lý từ bên ngoài
interface ActionCallbacks {
  onEdit?: () => void;
  onDelete?: () => void;
}

export function useTopicActions(topic: ITopic, callbacks?: ActionCallbacks) {
  const router = useRouter();

  const prepare = (groups: ActionItemConfig[][]): ActionItemConfig[][] =>
    groups.map((group) =>
      group.map((item) => {
        // Mặc định logic
        let finalOnClick = item.onClick;

        // Nếu có href thì ưu tiên router.push
        if (item.href) {
          finalOnClick = () => router.push(item.href as string);
        }

        // TIÊM LOGIC: Nếu label là "Chỉnh sửa" và có callback onEdit
        // (Hoặc bạn có thể check dựa trên icon/key nếu config có id)
        if (item.label === "Chỉnh sửa chủ đề" && callbacks?.onEdit) {
          finalOnClick = callbacks.onEdit;
        }

        return {
          ...item,
          show: item.show ?? true,
          onClick: finalOnClick,
        };
      }),
    );

  return {
    adminActions: prepare(TOPIC_ACTION_TYPES.ADMIN(topic)),
  };
}
