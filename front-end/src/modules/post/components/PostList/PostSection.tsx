"use client";

import { useCallback } from "react";
import { PAGINATION_CONFIG } from "@/constants/pagination";
import { Button } from "@/components/ui/button";
import { CardLayout } from "@/components/layout/CardLayout";
import { PaginationSection } from "@/components/shared/PaginationSection";
import { ContentFilter } from "@/components/shared/FilterMenu";
import { PostItem } from "./PostItem";
import { PostItemSkeleton } from "./PostItemSkeleton";
import { IPost } from "../../types";
import { LoginGuard } from "@/components/shared/LoginGuarđialog";
import Link from "next/link";
import { FileQuestion, PlusCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/EmtyState";
import { POST_FILTERS } from "../../constants/post";

// Định nghĩa Type chặt chẽ cho Params
interface PostParams {
  page: number;
  sort: string;
  startDate?: string;
  endDate?: string;
  topic?: string;
  tag?: string;
}

interface PostSectionProps {
  headerTitle: string;
  params: PostParams;
  posts: IPost[];
  pagination?: {
    totalPages: number;
    totalItems: number;
  };
  isFetching: boolean;
  onUpdateParams: (
    next: Record<string, string | number | null | undefined>,
  ) => void;
}

export function PostSection({
  headerTitle,
  params,
  posts,
  pagination,
  isFetching,
  onUpdateParams,
}: PostSectionProps) {
  // Reset về trạng thái mặc định: sort 'new', xóa ngày, về trang 1
  const handleReset = useCallback(() => {
    onUpdateParams({
      sort: "new", // Phải khớp với default value
      startDate: null,
      endDate: null,
      page: 1,
    });
  }, [onUpdateParams]);

  // Nhấn vào ngày là lọc ngay
  const handleDateChange = useCallback(
    (range: { startDate: string; endDate: string }) => {
      onUpdateParams({
        ...range,
        page: 1,
      });
    },
    [onUpdateParams],
  );

  return (
    <main>
      <CardLayout className="p-0 border-none shadow-sm">
        <div className="p-5 animate-in fade-in duration-700">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-primary">
              {headerTitle}
            </h2>
            <LoginGuard
              title="Tạo bài viết mới"
              description="Bạn cần đăng nhập để đóng góp bài viết cho cộng đồng nhé!"
            >
              <Link href="/posts/create" passHref>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  <span>New Post</span>
                </Button>
              </Link>
            </LoginGuard>
          </header>

          <ContentFilter
            totalCount={pagination?.totalItems ?? 0}
            options={POST_FILTERS}
            currentValue={params.sort}
            onFilterChange={(value) => onUpdateParams({ sort: value, page: 1 })}
            startDate={params.startDate}
            endDate={params.endDate}
            onDateChange={handleDateChange}
            onReset={handleReset}
            defaultFilterValue="new" // Nút Reset hiện khi sort khác 'new' hoặc có ngày
          />
        </div>

        <div className="h-[1px] bg-border w-full" />

        <div className="p-5 animate-in fade-in duration-700">
          <div className="space-y-4 min-h-[400px]">
            {posts.length > 0 ? (
              posts.map((post) => <PostItem key={post.postId} {...post} />)
            ) : isFetching ? (
              <SkeletonList count={PAGINATION_CONFIG.postsPerPage} />
            ) : (
              <EmptyState
                icon={FileQuestion}
                title="Danh sách trống"
                description="Hiện chưa có bài viết nào phù hợp với bộ lọc của bạn."
                actionLabel="Tạo bài viết ngay"
                actionHref="/posts/create"
              />
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

function SkeletonList({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PostItemSkeleton key={i} />
      ))}
    </>
  );
}
