// modules/post/hooks/usePostActions.tsx
import { useRouter } from "next/navigation";
import { POST_ACTION_TYPES } from "../constants/postActionConfigs";
import { IPost } from "../types";
import { ActionItemConfig } from "@/types/actionMenu";

export function usePostActions(post: IPost) {
  const router = useRouter();

  // Hàm nội bộ để gắn router.push vào href
  const prepare = (groups: ActionItemConfig[][]): ActionItemConfig[][] =>
    groups.map((group) =>
      group.map((item) => ({
        ...item,
        // Nếu đã xác định dùng trong bộ AUTHOR/ADMIN thì mặc định show là true nếu chưa set
        show: item.show ?? true,
        // Chỉ gán onClick nếu có href và chưa có onClick thủ công
        onClick: item.href
          ? () => router.push(item.href as string)
          : item.onClick,
      }))
    );

  return {
    authorActions: prepare(POST_ACTION_TYPES.AUTHOR(post)),
    adminActions: prepare(POST_ACTION_TYPES.ADMIN(post)),
  };
}
