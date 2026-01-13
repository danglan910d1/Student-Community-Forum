"use client";

import { useState, useEffect } from "react"; // Thêm useEffect
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginGuard } from "@/components/shared/LoginGuarđialog";
import { getAssetUrl } from "@/lib/utils";

export function CommentInput({
  onSubmit,
  placeholder = "Để lại ý kiến của bạn...",
  autoFocus = false,
  initialValue = "", // 1. Thêm prop giá trị mặc định
  onCancel, // 2. Thêm prop callback khi muốn hủy (tùy chọn)
}: {
  onSubmit: (content: string) => Promise<unknown>;
  placeholder?: string;
  autoFocus?: boolean;
  initialValue?: string;
  onCancel?: () => void;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState(initialValue); // Gán ban đầu
  const [loading, setLoading] = useState(false);

  // 3. Đảm bảo khi initialValue thay đổi (ví dụ đổi sang comment khác để sửa), input cập nhật theo
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSubmit(content);
      // Chỉ reset nội dung nếu không phải là đang sửa (initialValue trống)
      if (!initialValue) {
        setContent("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9 border">
        <AvatarImage src={getAssetUrl(user?.avatar)} />
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
            className="min-h-[80px] rounded-xl focus-visible:ring-primary bg-muted/30 resize-none"
            readOnly={!isAuthenticated}
          />
        </LoginGuard>

        <div className="flex justify-end gap-2">
          {" "}
          {/* 4. Hiện nút Hủy nếu đang ở chế độ sửa */}
          {initialValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={loading}
              className="text-xs"
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
              disabled={loading || !content.trim() || content === initialValue} // Thêm điều kiện: Không đổi thì không cho gửi
              onClick={handleSend}
              className="rounded-lg px-6 font-semibold"
            >
              {loading ? "Đang gửi..." : initialValue ? "Lưu" : "Gửi bình luận"}
            </Button>
          </LoginGuard>
        </div>
      </div>
    </div>
  );
}
