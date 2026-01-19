// modules/topic/constants/topicActionConfigs.tsx
import { Pencil, Eye } from "lucide-react";
import { ITopic } from "../types";
import { ActionItemConfig } from "@/types/actionMenu";
import { DeleteTopicButton } from "../DeleteTopicButton";
export const TOPIC_ACTION_TYPES = {
  // Bộ hành động dành cho Admin quản lý Topic
  ADMIN: (topic: ITopic): ActionItemConfig[][] => {
    return [
      [
        {
          label: "Xem bài viết",
          icon: Eye,
          href: `/posts?topic=${topic.slug}`,
        },
        {
          label: "Chỉnh sửa chủ đề",
          icon: Pencil,
        },
      ],
      [
        {
          // Component này đã được bọc bởi ConfirmActionModal bên trong
          component: (
            <DeleteTopicButton topicId={topic.topicId} topicName={topic.name} />
          ),
          variant: "destructive",
        },
      ],
    ];
  },
};
