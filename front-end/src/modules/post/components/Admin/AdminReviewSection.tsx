"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, SendHorizontal } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { StatusDecision } from "./StatusDecision";
import {
  PostStatusAction,
  TagApprovalAction,
  IPendingTagAction,
  IPost,
} from "../../types";
import { AdminTagReviewTabs } from "./AdminTagReviewTabs";

interface AdminReviewSectionProps {
  post: IPost;
  keepTagIds: string[];
  setKeepTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  pendingTagActions: IPendingTagAction[];
  setPendingTagActions: React.Dispatch<
    React.SetStateAction<IPendingTagAction[]>
  >;
  newPostStatus: PostStatusAction;
  setNewPostStatus: (status: PostStatusAction) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function AdminReviewSection({
  post,
  keepTagIds,
  setKeepTagIds,
  pendingTagActions,
  setPendingTagActions,
  newPostStatus,
  setNewPostStatus,
  onSubmit,
  isSubmitting,
}: AdminReviewSectionProps) {
  const handleActionChange = (tagId: string, action: TagApprovalAction) => {
    setPendingTagActions((prev) => {
      const filtered = prev.filter((item) => item.tagId !== tagId);
      return [...filtered, { tagId, action }];
    });
  };

  return (
    <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* PHẦN 1: TABS QUẢN LÝ THẺ */}
      <div className="space-y-4">
        <header className="px-1">
          <h2 className="text-[11px] uppercase tracking-widest">
            Kiểm duyệt phân loại
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Xử lý các thẻ tag trước khi cập nhật bài viết
          </p>
        </header>

        <AdminTagReviewTabs
          post={post}
          keepTagIds={keepTagIds}
          setKeepTagIds={setKeepTagIds}
          pendingTagActions={pendingTagActions}
          onActionChange={handleActionChange}
        />
      </div>

      <Separator />

      {/* PHẦN 2: RADIO CHỌN TRẠNG THÁI */}
      <div className="space-y-4">
        <header className="px-1">
          <h2 className="text-[11px] uppercase tracking-widest">
            Quyết định trạng thái
          </h2>
        </header>
        <StatusDecision
          status={newPostStatus}
          onStatusChange={setNewPostStatus}
        />
      </div>

      {/* PHẦN 3: ACTIONS */}
      <footer className="flex flex-col gap-4 pt-6">
        <Separator className="mb-2" />

        <Button
          size="lg"
          // Tận dụng variant chuẩn của Shadcn Button
          variant={newPostStatus === "approved" ? "default" : "destructive"}
          className="w-full h-16 rounded-xl gap-3 font-black uppercase text-[12px] tracking-widest transition-transform active:scale-[0.98] shadow-lg"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <SendHorizontal className="size-5" />
          )}
          {isSubmitting
            ? "Đang xử lý dữ liệu..."
            : "Xác nhận và kết thúc kiểm duyệt"}
        </Button>

        <p className="text-center text-[9px] text-muted-foreground uppercase tracking-[0.4em] font-bold opacity-60">
          Hệ thống sẽ cập nhật ngay lập tức sau khi xác nhận
        </p>
      </footer>
    </section>
  );
}
