"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CardLayout } from "@/components/layout/CardLayout";
import { ExistingTagGrid } from "./ExistingTagGrid";
import { AdminTagActionRow } from "./AdminTagActionRow";
import { IPost, IPendingTagAction, TagApprovalAction } from "../../types";

interface AdminTagReviewTabsProps {
  post: IPost;
  keepTagIds: string[];
  setKeepTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  pendingTagActions: IPendingTagAction[];
  onActionChange: (tagId: string, action: TagApprovalAction) => void;
}

export function AdminTagReviewTabs({
  post,
  keepTagIds,
  setKeepTagIds,
  pendingTagActions,
  onActionChange,
}: AdminTagReviewTabsProps) {
  const pendingCount = post.pending_tags?.length || 0;

  return (
    <Tabs
      defaultValue="pending"
      className="w-full animate-in fade-in duration-500"
    >
      <CardLayout className="p-0 border-none shadow-none bg-transparent flex flex-col overflow-hidden">
        {/* HEADER & TABS CONTROL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 px-1">
          <TabsList className="grid w-full sm:w-[320px] grid-cols-2">
            <TabsTrigger
              value="pending"
              className="text-[11px] font-bold uppercase relative gap-2"
            >
              Đề xuất
              {pendingCount > 0 && (
                <Badge
                  variant="default"
                  className="h-4 min-w-4 p-1 flex items-center justify-center text-[9px] font-black"
                >
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="existing"
              className="text-[11px] font-bold uppercase"
            >
              Hiện có
            </TabsTrigger>
          </TabsList>

          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60 hidden md:block">
            Rà soát phân loại
          </p>
        </div>

        {/* CONTENT AREA: Giới hạn chiều cao và cho phép scroll nếu quá dài */}
        <div className="flex-1 min-h-[120px] max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
          <TabsContent value="pending" className="mt-0 outline-none">
            <div className="bg-muted/30 rounded-xl border border-border/50 p-4 transition-colors">
              {post.pending_tags && post.pending_tags.length > 0 ? (
                <div className="grid gap-2">
                  {post.pending_tags.map((tag) => (
                    <AdminTagActionRow
                      key={tag.tagId}
                      tag={tag}
                      currentAction={
                        pendingTagActions.find((a) => a.tagId === tag.tagId)
                          ?.action
                      }
                      onActionChange={onActionChange}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/40">
                  <span className="text-[10px] uppercase font-black tracking-[0.2em]">
                    Sạch sẽ: Không có thẻ chờ duyệt
                  </span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="existing" className="mt-0 outline-none">
            <div className="bg-background/50 rounded-xl border border-border p-4">
              <ExistingTagGrid
                tags={post.tags}
                keepTagIds={keepTagIds}
                onToggle={(id, checked) =>
                  setKeepTagIds((prev) =>
                    checked ? [...prev, id] : prev.filter((x) => x !== id)
                  )
                }
              />
            </div>
          </TabsContent>
        </div>
      </CardLayout>
    </Tabs>
  );
}
