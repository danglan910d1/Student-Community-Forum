// src/containers/PostCommentsContainer.tsx
"use client";

import { CommentSection } from "../components/PostComments/CommentSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useComments } from "../hooks/useComments";

export function PostCommentsContainer({ postId }: { postId: string }) {
  const {
    comments,
    totalItems,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    createComment,
  } = useComments(postId);

  // Trạng thái load lần đầu tiên
  if (isLoading) return <CommentLoadingSkeleton />;

  return (
    <div className="animate-in fade-in duration-500">
      <CommentSection
        comments={comments}
        total={totalItems}
        onAddComment={(content, parentId) =>
          createComment(content, parentId ?? null)
        }
        hasNextPage={!!hasNextPage}
        onLoadMore={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}

// Giữ nguyên Skeleton của bạn vì nó đã rất đẹp
function CommentLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-20 flex-1 rounded-xl" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-14 w-[80%] rounded-2xl" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
