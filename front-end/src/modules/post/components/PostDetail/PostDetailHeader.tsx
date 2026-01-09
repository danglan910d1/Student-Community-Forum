"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Clock,
  Eye,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { IPost } from "../../types";
import { LikeButton } from "@/components/shared/LikeButton";
import { useLike } from "../../hooks/useLike";
import { LoginGuard } from "@/components/shared/LoginGuarđialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/useAuthStore"; // Để check quyền chủ bài viết
import { DeletePostButton } from "./DeletePostButton";

export function PostDetailHeader({ post }: { post: IPost }) {
  const router = useRouter();
  const { user } = useAuthStore(); // Lấy user hiện tại để check quyền
  const isAuthor = user?.userId === post.user.userId;

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

        {/* Nút hành động mở rộng (Chỉ hiện nếu là chủ bài viết hoặc admin) */}
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="w-5 h-5" />
                <span className="sr-only">Tùy chọn bài viết</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => router.push(`/posts/${post.postId}/edit`)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>

              {/* Xóa bài viết */}
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()} // Cực kỳ quan trọng
                className="focus:bg-red-50"
              >
                <DeletePostButton postId={post.postId} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

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
  );
}
