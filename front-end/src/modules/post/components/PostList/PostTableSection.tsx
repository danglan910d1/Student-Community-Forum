"use client";

import { CardLayout } from "@/components/layout/CardLayout";

import { PaginationSection } from "@/components/shared/PaginationSection";
import { PostDataTable } from "./PostDataTable";
import { IPost } from "../../types";
import { MY_POST_FILTERS, POST_FILTERS } from "../../constants/post";
import { ContentFilter } from "@/components/shared/FilterMenu";
import { AdminFilter } from "./AdminFilter";

interface PostTableSectionProps {
  posts: IPost[];
  params: { page: number; status: string; sort: string };
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
  return (
    <main className="animate-in fade-in duration-500 w-full min-w-0">
      <CardLayout className="p-0 border-none shadow-sm overflow-hidden flex flex-col h-[650px] w-full">
        {/* HEADER & FILTER AREA - Cố định phía trên */}
        <div className="px-6 pt-6 flex-none border-b pb-4">
          <header className="mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </header>
          {isAdminView ? (
            /* TRƯỜNG HỢP ADMIN: Hiện component tổng hợp */
            <AdminFilter
              statusValue={params.status}
              sortValue={params.sort}
              totalCount={pagination?.totalItems ?? 0}
              onUpdateParams={onUpdateParams}
            />
          ) : (
            /* TRƯỜNG HỢP USER: Hiện 1 filter như cũ */
            <ContentFilter
              titlePrefix={isMine ? "Trạng thái" : "Sắp xếp"}
              totalCount={pagination?.totalItems ?? 0}
              options={isMine ? MY_POST_FILTERS : POST_FILTERS}
              currentValue={isMine ? params.status : params.sort}
              onFilterChange={(value) => {
                const key = isMine ? "status" : "sort";
                onUpdateParams({ [key]: value, page: 1 });
              }}
              className="mb-0"
            />
          )}
        </div>
        {/* TABLE AREA - Có thể cuộn dọc và ngang */}
        <div className="flex-1 overflow-auto px-4 py-4 min-w-0">
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
