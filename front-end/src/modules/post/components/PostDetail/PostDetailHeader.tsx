"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Eye, MessageSquare, MoreVertical } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { IPost } from "../../types";
import { LikeButton } from "@/components/shared/LikeButton";
import { useLike } from "../../hooks/useLike";
import { LoginGuard } from "@/components/shared/LoginGuarđialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { ActionMenuContainer } from "@/components/shared/DropdownMenu/ActionMenuContainer";
import { usePostActions } from "../../hooks/usePostActionGroups";

export function PostDetailHeader({
  post,
  isAdminReview = false,
}: {
  post: IPost;
  isAdminReview?: boolean;
}) {
  const { user } = useAuthStore();
  const isAuthor = user?.userId === post.user.userId;

  // Lấy actions cho tác giả từ hook
  const { authorActions } = usePostActions(post);

  const { isLiked, likesCount, toggleLike } = useLike({
    targetType: "post",
    targetId: post.postId,
    initialLikesCount: post.likes_count,
  });

  return (
    <header className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-title text-2xl lg:text-3xl text-foreground font-bold leading-tight">
          {post.title}
        </h1>

        {/* Chỉ hiển thị menu hành động cho tác giả */}
        {isAuthor && !isAdminReview && (
          <ActionMenuContainer
            trigger={
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="w-5 h-5" />
                <span className="sr-only">Tùy chọn bài viết</span>
              </Button>
            }
            groups={authorActions}
          />
        )}
      </div>

      {!isAdminReview && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>
              Đăng ngày{" "}
              {format(new Date(post.createdAt), "dd/MM/yyyy", { locale: vi })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{post.views_count.toLocaleString()} lượt xem</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments_count} bình luận</span>
          </div>

          <LoginGuard
            title="Yêu thích bài viết"
            description="Đăng nhập để ủng hộ tác giả bạn nhé!"
          >
            <LikeButton
              isLiked={isLiked}
              likesCount={likesCount}
              onLike={toggleLike}
            />
          </LoginGuard>
        </div>
      )}

      <Separator />
    </header>
  );
}
