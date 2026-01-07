"use client";

import ContentPageSkeleton from "@/components/loading/ContentPageSkeleton";
import { usePostDetail } from "../hooks/usePostDetail";
import { PostDetailSection } from "../components/PostDetail/PostDetailSection";
import { EmptyState } from "@/components/shared/EmtyState";
import { FileSearch } from "lucide-react";

export function PostDetailContainer({ postId }: { postId: string }) {
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
      <EmptyState
        icon={FileSearch}
        title="Không tìm thấy bài viết"
        description="Bài viết bạn đang tìm kiếm có thể đã bị xóa, thay đổi địa chỉ hoặc không tồn tại trên hệ thống."
        actionLabel="Quay lại danh sách"
        actionHref="/posts"
      />
    );
  }

  return <PostDetailSection post={post} />;
}
