"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { LikeButton } from "@/components/shared/LikeButton";
import { CommentInput } from "./CommentInput";
import { useLike } from "../../hooks/useLike";
import { IComment } from "../../types";
import { useDeleteComment } from "../../hooks/useDeleteComment";
import { useAuthStore } from "@/stores/useAuthStore";
import { MessageSquareReply, Pencil, Trash2 } from "lucide-react";
import { LoginGuard } from "@/components/shared/LoginGuarđialog";
import { Button } from "@/components/ui/button";
import { ReplyList } from "./ReplyList";
import { getAssetUrl } from "@/lib/utils";

export function CommentItem({
  comment,
  onReply,
  onUpdate,
}: {
  comment: IComment;
  onReply: (content: string, parentId: string) => Promise<unknown>;
  onUpdate: (content: string, commentId: string) => Promise<unknown>; // Định nghĩa type
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const { user } = useAuthStore();
  const deleteMutation = useDeleteComment();

  const isOwner = user?.userId === comment.user.userId;

  const { isLiked, likesCount, toggleLike, isPending } = useLike({
    targetType: "comment",
    targetId: comment.commentId,
    initialLikesCount: comment.likes_count,
  });

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) {
      deleteMutation.mutate(comment.commentId);
    }
  };

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-300">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0 border">
          <AvatarImage
            src={getAssetUrl(comment.user.avatar)}
            alt={comment.user.name}
          />
          <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 p-3 rounded-2xl group relative">
            <p className="text-sm font-bold mb-1 text-foreground">
              {comment.user.name}
            </p>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <CommentInput
                  initialValue={comment.content}
                  autoFocus
                  onSubmit={async (val) => {
                    await onUpdate(val, comment.commentId);
                    setIsEditing(false);
                  }}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </div>
            )}

            {isOwner && !isEditing && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                {/* Nút Chỉnh sửa */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>

                {/* Nút Xóa */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 px-1">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: vi,
              })}
            </span>

            {/* GUARD CHO LIKE */}
            <LoginGuard
              title="Yêu thích bình luận"
              description="Đăng nhập để bày tỏ sự đồng cảm với bình luận này bạn nhé!"
            >
              <LikeButton
                isLiked={isLiked}
                likesCount={likesCount}
                onLike={toggleLike}
                isPending={isPending}
                className="h-auto p-0 text-xs font-bold"
              />
            </LoginGuard>

            {/* GUARD CHO PHẢN HỒI */}
            <LoginGuard
              title="Phản hồi bình luận"
              description="Tham gia thảo luận bằng cách đăng nhập vào hệ thống."
              className="flex items-center"
            >
              <Button
                variant={"ghost"}
                onClick={() => setIsReplying(!isReplying)}
                className="h-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                Phản hồi{" "}
                {comment.replies_count > 0 && `(${comment.replies_count})`}
              </Button>
            </LoginGuard>

            {isOwner && (
              <Button
                variant={"ghost"}
                onClick={handleDelete}
                className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"
              >
                Xóa
              </Button>
            )}
          </div>

          {isReplying && (
            <div className="mt-3 ml-2 border-l-2 border-muted pl-4 animate-in slide-in-from-top-2 duration-200">
              <CommentInput
                autoFocus
                placeholder={`Trả lời ${comment.user.name}...`}
                onSubmit={async (val) => {
                  await onReply(val, comment.commentId);
                  setIsReplying(false);
                  setShowReplies(true);
                }}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}

          {comment.replies_count > 0 && !showReplies && (
            <Button
              variant="ghost"
              className="mt-2 ml-1 flex items-center gap-2 text-[12px] font-bold text-primary hover:bg-transparent p-0 h-auto"
              onClick={() => setShowReplies(true)}
            >
              <MessageSquareReply className="w-3.5 h-3.5" />
              Xem {comment.replies_count} phản hồi
            </Button>
          )}

          {/* Danh sách phản hồi con (Đệ quy) */}
          {showReplies && (
            <div className="mt-4 space-y-5 ml-2 border-l-2 border-muted/50 pl-4">
              <ReplyList
                onUpdate={onUpdate}
                postId={comment.postId}
                parentId={comment.commentId}
                onReply={onReply}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
