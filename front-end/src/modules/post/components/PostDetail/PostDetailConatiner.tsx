"use client";

import React from "react";
import MDEditor from "@uiw/react-md-editor";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Clock,
  Eye,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  FileSearch,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ContentPageSkeleton from "@/components/loading/ContentPageSkeleton";
import { usePostDetail } from "../../hooks/usePostDetail";
import { EmptyState } from "@/components/shared/EmtyState";

interface PostDetailContainerProps {
  postId: string;
}

export function PostDetailContainer({ postId }: PostDetailContainerProps) {
  const { data: post, isLoading, isError } = usePostDetail(postId);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ContentPageSkeleton />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-20">
        <EmptyState
          icon={FileSearch}
          title="Không tìm thấy bài viết"
          description="Bài viết bạn đang tìm kiếm có thể đã bị xóa, thay đổi địa chỉ hoặc không tồn tại trên hệ thống."
          actionLabel="Quay lại danh sách"
          actionHref="/posts" // Sử dụng router.push đã tích hợp trong EmptyState
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 1. HEADER */}
      <header className="mb-6 border-b pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
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
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. SIDEBAR VOTE */}
        <div className="lg:col-span-1 flex flex-col items-center gap-4 pt-1">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 border-muted-foreground/20"
          >
            <ChevronUp className="w-6 h-6" />
          </Button>
          <span className="text-xl font-bold text-foreground/80">
            {post.likes_count}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10 border-muted-foreground/20"
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
        </div>

        {/* 3. NỘI DUNG CHÍNH */}
        <div className="lg:col-span-8">
          <article className="min-h-[300px]">
            <div
              data-color-mode="light"
              className="prose prose-slate max-w-none"
            >
              <MDEditor.Markdown
                source={post.content}
                style={{
                  backgroundColor: "transparent",
                  color: "var(--foreground)",
                  fontSize: "1rem",
                }}
              />
            </div>

            {/* TAGS */}
            <div className="flex gap-2 mt-10 flex-wrap">
              {post.tags.map((tag) => (
                <Badge
                  key={tag.tagId}
                  variant="secondary"
                  className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none transition-colors"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>

            {/* AUTHOR CARD */}
            <div className="flex justify-end mt-8">
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 w-full max-w-[240px]">
                <p className="text-[11px] text-muted-foreground mb-3 font-medium">
                  Đã hỏi lúc{" "}
                  {format(new Date(post.createdAt), "HH:mm, 'ngày' dd/MM", {
                    locale: vi,
                  })}
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 shrink-0 overflow-hidden rounded shadow-sm">
                    <img
                      src={
                        post.user.avatar ||
                        "https://placehold.co/100x100?text=User"
                      }
                      alt={post.user.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer truncate">
                      {post.user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                      {post.user.role || "Thành viên"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* 4. SIDEBAR THÔNG TIN */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="p-4 border rounded-xl bg-card shadow-sm">
            <h4 className="font-bold text-xs uppercase text-muted-foreground mb-4 tracking-widest">
              Thông tin bổ sung
            </h4>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Chủ đề
                </span>
                <span className="text-sm font-medium hover:text-primary cursor-pointer transition-colors">
                  {post.topic?.name || "Đang cập nhật"}
                </span>
              </div>
              <div className="pt-3 border-t flex flex-col gap-2">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Trạng thái
                </span>
                <div>
                  <Badge
                    variant="outline"
                    className={
                      post.is_resolved
                        ? "text-green-600 bg-green-50 border-green-200"
                        : "text-amber-600 bg-amber-50 border-amber-200"
                    }
                  >
                    {post.is_resolved ? "Đã giải quyết" : "Đang chờ giải đáp"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
