"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Eye, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { IPost } from "../../types";
import { LikeButton } from "@/components/shared/LikeButton";
import { useLike } from "../../hooks/useLike";
import { LoginGuard } from "@/components/shared/LoginGuarđialog";

export function PostDetailHeader({ post }: { post: IPost }) {
  const { isLiked, likesCount, toggleLike } = useLike({
    targetType: "post",
    targetId: post.postId,
    initialLikesCount: post.likes_count,
  });

  return (
    <>
      <header className="space-y-4">
        <h1 className="text-title text-2xl lg:text-3xl text-foreground font-bold leading-tight">
          {post.title}
        </h1>

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
            description="Đăng nhập để lưu bài viết này vào danh sách yêu thích và ủng hộ tác giả bạn nhé!"
          >
            <LikeButton
              isLiked={isLiked}
              likesCount={likesCount}
              onLike={toggleLike}
            />
          </LoginGuard>
        </div>

        <Separator />
      </header>
    </>
  );
}
