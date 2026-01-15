// modules/post/constants/postActionConfigs.tsx
import { Eye, Pencil, CheckCircle, Pin } from "lucide-react";
import { IPost } from "../types";
import { ActionItemConfig } from "@/types/actionMenu";
import { DeletePostButton } from "../components/PostDetail/DeletePostButton";
import { getPostLink } from "../utils/postQueryMapper";

export const POST_ACTION_TYPES = {
  // Bộ hành động dành cho tác giả bài viết
  AUTHOR: (post: IPost): ActionItemConfig[][] => {
    const isApproved = post.status === "approved";

    // Nhóm 1: Thao tác nội dung
    const mainActions: ActionItemConfig[] = [
      {
        label: "Chỉnh sửa bài viết",
        icon: Pencil,
        href: `/posts/${post.postId}/edit`,
      },
    ];

    // NẾU APPROVED THÌ MỚI THÊM NÚT XEM (Đủ 3 hành động như bạn muốn)
    if (isApproved) {
      mainActions.unshift({
        label: "Xem bài viết",
        icon: Eye,
        href: getPostLink(post, false, true), // Trả về /posts/id/slug
      });
    }

    return [
      mainActions,
      [
        {
          component: <DeletePostButton postId={post.postId} />,
          variant: "destructive",
        },
      ],
    ];
  },

  // Bộ hành động dành cho Admin
  ADMIN: (post: IPost): ActionItemConfig[][] => {
    const isApproved = post.status === "approved";
    const adminHref = getPostLink(post, true, false);

    return [
      [
        {
          label: isApproved ? "Xem chi tiết" : "Duyệt & Phê duyệt",
          icon: isApproved ? Eye : CheckCircle,
          href: adminHref,
        },
      ],
      [
        {
          label: post.is_sticky ? "Bỏ ghim bài" : "Ghim bài viết",
          icon: Pin,
        },
      ],
      [
        {
          component: <DeletePostButton postId={post.postId} />,
          variant: "destructive",
        },
      ],
    ];
  },
};
