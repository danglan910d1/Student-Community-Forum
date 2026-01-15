"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginGuard } from "@/components/shared/LoginGuarđialog";
import { UserAvatar } from "@/components/shared/UserAvatar";

export function CommentInput({
  onSubmit,
  placeholder = "Để lại ý kiến của bạn...",
  autoFocus = false,
  initialValue = "",
  onCancel,
}: {
  onSubmit: (content: string) => Promise<unknown>;
  placeholder?: string;
  autoFocus?: boolean;
  initialValue?: string;
  onCancel?: () => void;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSubmit(content);
      if (!initialValue) {
        setContent("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      {/* Cập nhật UserAvatar: 
         - Không dùng showOnlineStatus như yêu cầu.
         - Truyền user object (bao gồm userId) để có hiệu ứng hover pointer 
           và click chuyển trang đồng bộ với UserIdentity.
      */}
      <UserAvatar
        user={
          user
            ? {
                userId: user.userId,
                name: user.name,
                avatar: user.avatar,
              }
            : undefined
        }
        size="sm"
        shape="circle"
        className="shrink-0 border-border/50"
      />

      <div className="flex-1 space-y-2">
        <LoginGuard
          title="Viết bình luận"
          description="Đăng nhập để chia sẻ ý kiến của bạn về bài viết này."
        >
          <div className="relative">
            <Textarea
              autoFocus={autoFocus}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="min-h-[80px] rounded-xl focus-visible:ring-primary bg-muted/30 border-border/60 resize-none transition-all placeholder:text-muted-foreground/60 p-3"
              readOnly={!isAuthenticated}
            />
          </div>
        </LoginGuard>

        <div className="flex justify-end gap-2">
          {initialValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={loading}
              className="text-xs font-medium hover:bg-muted"
            >
              Hủy
            </Button>
          )}

          <LoginGuard
            title="Gửi bình luận"
            description="Vui lòng đăng nhập để gửi đóng góp của bạn."
          >
            <Button
              size="sm"
              disabled={loading || !content.trim() || content === initialValue}
              onClick={handleSend}
              className="rounded-lg px-6 font-bold shadow-sm transition-all"
            >
              {loading
                ? "Đang gửi..."
                : initialValue
                  ? "Lưu thay đổi"
                  : "Gửi bình luận"}
            </Button>
          </LoginGuard>
        </div>
      </div>
    </div>
  );
}
