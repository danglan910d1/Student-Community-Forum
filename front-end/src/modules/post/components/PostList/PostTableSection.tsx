"use client";

import { CardLayout } from "@/components/layout/CardLayout";

import { PaginationSection } from "@/components/shared/PaginationSection";
import { PostDataTable } from "./PostDataTable";
import { IPost } from "../../types";
import { POST_FILTERS } from "../../constants/post";
import { ContentFilter } from "@/components/shared/FilterMenu";
import { AdminFilter } from "./AdminFilter";
import { useCallback } from "react";

interface PostTableSectionProps {
  posts: IPost[];
  params: {
    page: number;
    status: string;
    sort: string;
    startDate?: string;
    endDate?: string;
  };
  pagination?: { totalPages: number; totalItems: number };
  isFetching: boolean;
  onUpdateParams: (next: Record<string, string | number | null>) => void;
  isMine: boolean;
  isAdminView?: boolean;
}

export function PostTableSection({
  posts,
  params,
  pagination,
  isFetching,
  onUpdateParams,
  isMine,
  isAdminView,
}: PostTableSectionProps) {
  const title = isAdminView
    ? "Quản trị bài viết"
    : isMine
      ? "Quản lý bài viết"
      : "Bài viết đã đăng";
  const description = isAdminView
    ? "Xem và điều duyệt toàn bộ bài viết trên hệ thống."
    : isMine
      ? "Theo dõi và quản lý các nội dung bạn đã đóng góp."
      : "Danh sách các nội dung công khai của thành viên.";

  const handleReset = useCallback(() => {
    onUpdateParams({
      status: "all", // Giá trị mặc định cho status
      sort: "new", // Giá trị mặc định cho sort
      startDate: null,
      endDate: null,
      page: 1,
    });
  }, [onUpdateParams]);
  return (
    <main className="animate-in fade-in duration-500 w-full min-w-0 h-[800px] flex flex-col">
      {/* CardLayout phải có flex-col và h-full */}
      <CardLayout className="p-0 border shadow-sm overflow-hidden flex flex-col h-full w-full bg-card">
        {/* HEADER & FILTER - flex-none để không bị co giãn */}
        <div className="px-6 pt-6 flex-none border-b pb-4">
          <header className="mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </header>
          {isAdminView || isMine ? (
            <AdminFilter
              statusValue={params.status}
              sortValue={params.sort}
              totalCount={pagination?.totalItems ?? 0}
              onUpdateParams={onUpdateParams}
              startDate={params.startDate}
              endDate={params.endDate}
              isMine={isMine}
              onReset={handleReset}
            />
          ) : (
            <ContentFilter
              titlePrefix="Sắp xếp"
              totalCount={pagination?.totalItems ?? 0}
              options={POST_FILTERS}
              currentValue={params.sort}
              onFilterChange={(val) => onUpdateParams({ sort: val, page: 1 })}
              startDate={params.startDate}
              endDate={params.endDate}
              onDateChange={(range) => onUpdateParams({ ...range, page: 1 })}
              onReset={handleReset}
              defaultFilterValue="new"
              className="mb-0"
            />
          )}
        </div>

        {/* TABLE AREA - flex-1 và overflow-hidden để ép nội dung con scroll */}
        <div className="flex-1 overflow-hidden px-4 py-2 ">
          {isFetching ? (
            <TableSkeleton />
          ) : (
            <PostDataTable
              posts={posts}
              isMine={isMine}
              isAdminView={isAdminView}
            />
          )}
        </div>

        {/* PAGINATION - flex-none để luôn dính dưới đáy */}
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

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-16 w-full bg-muted/50 animate-pulse rounded-md"
        />
      ))}
    </div>
  );
}
