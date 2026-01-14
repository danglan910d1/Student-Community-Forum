// modules/post/components/Admin/AdminReviewSection.tsx
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AdminTagActionRow } from "./AdminTagActionRow";
import { TagApprovalAction, IPendingTagAction } from "../../types";
import { ITag } from "@/modules/tag/types";

interface IMinimalTag {
  tagId: string;
  name: string;
  slug: string;
}

interface AdminReviewSectionProps {
  post: {
    // Thay vì ITag[], ta dùng IMinimalTag[]
    tags: IMinimalTag[];
    pending_tags?: IMinimalTag[];
  };
  keepTagIds: string[];
  setKeepTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  pendingTagActions: IPendingTagAction[];
  setPendingTagActions: React.Dispatch<
    React.SetStateAction<IPendingTagAction[]>
  >;
  newPostStatus: "approved" | "rejected";
  setNewPostStatus: (status: "approved" | "rejected") => void;
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
  // Xử lý thay đổi hành động cho từng tag pending
  const handleActionChange = (tagId: string, action: TagApprovalAction) => {
    setPendingTagActions((prev) => {
      const filtered = prev.filter((item) => item.tagId !== tagId);
      return [...filtered, { tagId, action }];
    });
  };

  // Xử lý bật/tắt tag cũ
  const handleKeepToggle = (tagId: string, checked: boolean) => {
    setKeepTagIds((prev) =>
      checked ? [...prev, tagId] : prev.filter((id) => id !== tagId)
    );
  };

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-3">
        <Badge className="rounded-full w-8 h-8 flex items-center justify-center border-primary bg-primary text-primary-foreground font-bold">
          B
        </Badge>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 uppercase">
          Kiểm duyệt thẻ và trạng thái
        </h2>
      </div>

      {/* 1. TAG MANAGEMENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EXISTING TAGS (LEFT) */}
        <div className="space-y-4 bg-slate-50 p-5 rounded-xl border">
          <div className="flex items-center justify-between">
            <Label className="font-bold">Thẻ hiện có trong bài</Label>
            <Badge variant="outline">{post.tags?.length || 0}</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {post.tags && post.tags.length > 0 ? (
              post.tags.map((tag) => (
                <div
                  key={tag.tagId}
                  className={`flex items-center space-x-2 p-2 px-3 rounded-md border bg-white transition-opacity ${
                    !keepTagIds.includes(tag.tagId) && "opacity-50"
                  }`}
                >
                  <Checkbox
                    id={`keep-${tag.tagId}`}
                    checked={keepTagIds.includes(tag.tagId)}
                    onCheckedChange={(checked) =>
                      handleKeepToggle(tag.tagId, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`keep-${tag.tagId}`}
                    className="text-sm font-medium cursor-pointer select-none"
                  >
                    {tag.name}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-xs italic text-muted-foreground">
                Không có thẻ cũ.
              </p>
            )}
          </div>
        </div>

        {/* PENDING TAGS (RIGHT) */}
        <div className="space-y-4 bg-orange-50/50 p-5 rounded-xl border border-orange-100">
          <div className="flex items-center justify-between">
            <Label className="font-bold text-orange-700">Thẻ đề xuất mới</Label>
            <Badge className="bg-orange-500">
              {post.pending_tags?.length || 0}
            </Badge>
          </div>

          <div className="space-y-2">
            {post.pending_tags && post.pending_tags.length > 0 ? (
              post.pending_tags.map((tag) => (
                <AdminTagActionRow
                  key={tag.tagId}
                  tag={tag}
                  onActionChange={handleActionChange}
                />
              ))
            ) : (
              <div className="p-6 text-center border border-dashed rounded-lg bg-white text-muted-foreground text-sm italic">
                Không có thẻ cần phê duyệt.
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* 2. FINAL STATUS DECISION */}
      <div className="p-6 rounded-2xl bg-slate-50 border space-y-6">
        <div className="text-center">
          <Label className="text-xl font-bold uppercase">
            Quyết định bài viết
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Chọn trạng thái hiển thị của bài viết sau khi kiểm duyệt
          </p>
        </div>

        <RadioGroup
          value={newPostStatus}
          onValueChange={(val) =>
            setNewPostStatus(val as "approved" | "rejected")
          }
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* APPROVE OPTION */}
          <Label
            htmlFor="ap"
            className={`flex items-center space-x-3 p-4 border-2 rounded-xl bg-white cursor-pointer transition-all ${
              newPostStatus === "approved"
                ? "border-green-500 bg-green-50/50"
                : "hover:border-slate-300"
            }`}
          >
            <RadioGroupItem value="approved" id="ap" />
            <div>
              <span className="block font-bold text-green-700 uppercase">
                Chấp nhận
              </span>
              <span className="text-xs text-muted-foreground">
                Hiển thị bài viết công khai
              </span>
            </div>
          </Label>

          {/* REJECT OPTION */}
          <Label
            htmlFor="rj"
            className={`flex items-center space-x-3 p-4 border-2 rounded-xl bg-white cursor-pointer transition-all ${
              newPostStatus === "rejected"
                ? "border-red-500 bg-red-50/50"
                : "hover:border-slate-300"
            }`}
          >
            <RadioGroupItem value="rejected" id="rj" />
            <div>
              <span className="block font-bold text-red-700 uppercase">
                Từ chối
              </span>
              <span className="text-xs text-muted-foreground">
                Ẩn bài viết khỏi hệ thống
              </span>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* 3. SUBMIT ACTION */}
      <div className="flex flex-col items-center gap-3">
        <Button
          size="lg"
          className={`w-full max-w-sm font-bold h-12 rounded-xl shadow-md ${
            newPostStatus === "approved"
              ? "bg-primary"
              : "bg-red-600 hover:bg-red-700"
          }`}
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ĐANG XỬ LÝ...
            </span>
          ) : (
            `XÁC NHẬN ${newPostStatus === "approved" ? "DUYỆT" : "TỪ CHỐI"}`
          )}
        </Button>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Hành động này không thể hoàn tác
        </span>
      </div>
    </section>
  );
}
