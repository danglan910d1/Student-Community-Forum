// modules/post/components/PostList/PostSection.tsx
"use client";

import { PAGINATION_CONFIG } from "@/constants/pagination";
import { Button } from "@/components/ui/button";
import { CardLayout } from "@/components/layout/CardLayout";
import { PaginationSection } from "@/components/shared/PaginationSection";
import { ContentFilter } from "@/components/shared/FilterMenu";

import { PostItem } from "./PostItem";
import { PostItemSkeleton } from "./PostItemSkeleton";
import { IPost } from "../../types";

interface PostSectionProps {
  headerTitle: string;
  params: {
    page: number;
    sort: string;
  };
  posts: IPost[];
  pagination?: {
    totalPages: number;
    totalItems: number;
  };
  isFetching: boolean;
  onUpdateParams: (next: Record<string, string | number | null>) => void;
}

export function PostSection({
  headerTitle,
  params,
  posts,
  pagination,
  isFetching,
  onUpdateParams,
}: PostSectionProps) {
  return (
    <main>
      <CardLayout className="p-0 border-none shadow-sm">
        {/* HEADER */}
        <div className="p-5">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold uppercase">{headerTitle}</h2>
            <Button>New Post</Button>
          </header>

          <ContentFilter
            totalCount={pagination?.totalItems ?? 0}
            options={POST_FILTERS}
            currentValue={params.sort}
            onFilterChange={(value) => onUpdateParams({ sort: value, page: 1 })}
          />
        </div>

        <div className="h-[1px] bg-border w-full" />

        {/* LIST */}
        <div className="p-5">
          <div className="space-y-4 min-h-[400px]">
            {posts.length > 0 ? (
              posts.map((post) => <PostItem key={post.postId} {...post} />)
            ) : isFetching ? (
              <SkeletonList count={PAGINATION_CONFIG.postsPerPage} />
            ) : (
              <EmptyState message="Không tìm thấy bài viết nào." />
            )}
          </div>

          <div className="mt-8 border-t pt-4">
            <PaginationSection
              currentPage={params.page}
              totalPages={pagination?.totalPages ?? 1}
              onPageChange={(page) => onUpdateParams({ page })}
            />
          </div>
        </div>
      </CardLayout>
    </main>
  );
}

const POST_FILTERS = [
  { label: "Mới nhất", value: "new" },
  { label: "Phổ biến", value: "popular" },
  { label: "Đã Giải quyết", value: "resolved" },
];

function SkeletonList({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PostItemSkeleton key={i} />
      ))}
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-20 text-center text-muted-foreground">
      <p>{message}</p>
    </div>
  );
}
