"use client";

import { CardLayout } from "@/components/layout/CardLayout";

import { PaginationSection } from "@/components/shared/PaginationSection";
import { PostDataTable } from "./PostDataTable";
import { IPost } from "../../types";
import { MY_POST_FILTERS } from "../../constants/post";
import { ContentFilter } from "@/components/shared/FilterMenu";

interface PostTableSectionProps {
  posts: IPost[];
  params: { page: number; status: string };
  pagination?: { totalPages: number; totalItems: number };
  isFetching: boolean;
  onUpdateParams: (next: Record<string, string | number | null>) => void;
}

export function PostTableSection({
  posts,
  params,
  pagination,
  isFetching,
  onUpdateParams,
}: PostTableSectionProps) {
  return (
    <main className="animate-in fade-in duration-500 w-full min-w-0">
      <CardLayout className="p-0 border-none shadow-sm overflow-hidden flex flex-col h-[650px] w-full">
        {/* HEADER & FILTER AREA - Cố định phía trên */}
        <div className="px-6 pt-6 flex-none border-b pb-4">
          <header className="mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-tight">
              Quản lý bài viết
            </h2>
            <p className="text-sm text-muted-foreground">
              Theo dõi và quản lý các nội dung bạn đã đóng góp.
            </p>
          </header>

          <ContentFilter
            titlePrefix="Tổng số"
            totalCount={pagination?.totalItems ?? 0}
            options={MY_POST_FILTERS}
            currentValue={params.status}
            onFilterChange={(value) =>
              onUpdateParams({ status: value, page: 1 })
            }
            className="mb-0"
          />
        </div>

        {/* TABLE AREA - Có thể cuộn dọc và ngang */}
        <div className="flex-1 overflow-auto px-6 py-4 min-w-0">
          {isFetching ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-full bg-muted/50 animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : (
            <PostDataTable posts={posts} />
          )}
        </div>

        {/* PAGINATION - Cố định phía dưới */}
        <div className="px-6 py-4 flex-none border-t bg-card">
          <PaginationSection
            currentPage={params.page}
            totalPages={pagination?.totalPages ?? 1}
            onPageChange={(page) => onUpdateParams({ page })}
          />
        </div>
      </CardLayout>
    </main>
  );
}
