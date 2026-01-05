"use client";

import ContentPageSkeleton from "@/components/loading/ContentPageSkeleton";
import { usePostDetail } from "../hooks/usePostDetail";
import { PostDetailSection } from "../components/PostDetail/PostDetailSection";

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
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold">Không tìm thấy bài viết</h2>
        <p className="text-muted-foreground">
          Bài viết có thể đã bị xóa hoặc không tồn tại.
        </p>
      </div>
    );
  }

  return <PostDetailSection post={post} />;
}
