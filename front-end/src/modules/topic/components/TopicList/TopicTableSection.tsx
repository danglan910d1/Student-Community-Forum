"use client";

import { useCallback } from "react";
import { CardLayout } from "@/components/layout/CardLayout";
import { PaginationSection } from "@/components/shared/PaginationSection";
import { TopicDataTable } from "./TopicDataTable";
import { ITopic } from "../../types";
import { AdminFilter } from "@/modules/post/components/PostList/AdminFilter";
import { CreateTopicDialog } from "../TopicForm/CreateTopicDialog";
interface TopicTableSectionProps {
  topics: ITopic[];
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
}

export function TopicTableSection({
  topics,
  params,
  pagination,
  isFetching,
  onUpdateParams,
}: TopicTableSectionProps) {
  const handleReset = useCallback(() => {
    onUpdateParams({
      status: "all",
      sort: "new",
      startDate: null,
      endDate: null,
      page: 1,
    });
  }, [onUpdateParams]);

  return (
    <main className="animate-in fade-in duration-500 w-full min-w-0 h-[800px] flex flex-col">
      <CardLayout className="p-0 border shadow-sm overflow-hidden flex flex-col h-full w-full bg-card">
        {/* HEADER QUẢN TRỊ */}
        <div className="px-6 pt-6 flex-none border-b pb-4">
          <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-primary">
                Quản trị chủ đề
              </h2>
              <p className="text-sm text-muted-foreground">
                Xem, chỉnh sửa và quản lý toàn bộ các danh mục chủ đề trên hệ
                thống.
              </p>
            </div>

            {/* NÚT THÊM CHỦ ĐỀ MỚI */}
            <div className="flex-none">
              <CreateTopicDialog />
            </div>
          </header>

          <AdminFilter
            statusValue={params.status}
            sortValue={params.sort}
            totalCount={pagination?.totalItems ?? 0}
            onUpdateParams={onUpdateParams}
            startDate={params.startDate}
            endDate={params.endDate}
            isMine={false}
            onReset={handleReset}
          />
        </div>

        {/* TABLE AREA */}
        <div className="flex-1 overflow-hidden px-4 py-2">
          {isFetching ? <TableSkeleton /> : <TopicDataTable topics={topics} />}
        </div>

        {/* PAGINATION */}
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
    <div className="space-y-4 p-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-20 w-full bg-muted/50 animate-pulse rounded-md"
        />
      ))}
    </div>
  );
}
