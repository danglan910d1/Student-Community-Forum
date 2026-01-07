"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginGuard } from "@/components/shared/LoginGuarđialog";

export function CommentInput({
  onSubmit,
  placeholder = "Để lại ý kiến của bạn...",
  autoFocus = false,
}: {
  onSubmit: (content: string) => Promise<unknown>;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSubmit(content);
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9 border">
        <AvatarImage src={user?.avatar} />
        <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <LoginGuard
          title="Viết bình luận"
          description="Đăng nhập để chia sẻ ý kiến của bạn về bài viết này."
        >
          <Textarea
            autoFocus={autoFocus}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            // Nếu chưa login, ta có thể làm mờ nhẹ hoặc đổi cursor để gợi ý
            className="min-h-[80px] rounded-xl focus-visible:ring-primary bg-muted/30 resize-none"
            readOnly={!isAuthenticated} // Ngăn gõ phím nếu chưa login (dù Guard đã chặn click)
          />
        </LoginGuard>

        <div className="flex justify-end">
          <LoginGuard
            title="Gửi bình luận"
            description="Vui lòng đăng nhập để gửi đóng góp của bạn."
          >
            <Button
              size="sm"
              disabled={loading || !content.trim()}
              onClick={handleSend}
              className="rounded-lg px-6 font-semibold"
            >
              {loading ? "Đang gửi..." : "Gửi bình luận"}
            </Button>
          </LoginGuard>
        </div>
      </div>
    </div>
  );
}
