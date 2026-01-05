"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/useAuthStore";

export function CommentInput({
  onSubmit,
  placeholder = "Để lại ý kiến của bạn...",
  autoFocus = false,
}: {
  // Đổi từ Promise<void> thành Promise<unknown>
  onSubmit: (content: string) => Promise<unknown>;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSubmit(content);
      setContent(""); // Chỉ xóa chữ khi onSubmit thành công
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9 border">
        <AvatarImage src={user?.avatar} />
        <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          autoFocus={autoFocus}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          // Đổi ring-pink-500 thành ring-primary hoặc ring-ring
          className="min-h-[80px] rounded-xl focus-visible:ring-primary bg-muted/30"
        />
        <div className="flex justify-end">
          <Button
            disabled={loading || !content.trim()}
            onClick={handleSend}
            // Xóa bg-pink-600, sử dụng mặc định của Button (thường là primary)
            className="rounded-full"
          >
            Gửi bình luận
          </Button>
        </div>
      </div>
    </div>
  );
}
