// modules/topic/components/TopicList/TopicTableSection.tsx
"use client";

import { useCallback, useEffect, useState } from "react"; // Thêm useState
import { CardLayout } from "@/components/layout/CardLayout";
import { PaginationSection } from "@/components/shared/PaginationSection";
import { TopicDataTable } from "./TopicDataTable";
import { ITopic } from "../../types";
import { AdminFilter } from "@/modules/post/components/PostList/AdminFilter";
import { CreateTopicDialog } from "../TopicForm/CreateTopicDialog";
import { TAXONOMY_SORT_OPTIONS } from "../../constants/topic";
import { Search } from "lucide-react"; // Thêm icon Search
import { Input } from "@/components/ui/input"; // Thêm Input

interface TopicTableSectionProps {
  topics: ITopic[];
  params: {
    page: number;
    status: string;
    sort: string;
    startDate?: string;
    endDate?: string;
    slug?: string; // Thêm slug vào type params
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
  const [searchInput, setSearchInput] = useState(params.slug || "");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onUpdateParams({ slug: searchInput.trim() || null, page: 1 });
    }
  };

  const handleReset = useCallback(() => {
    setSearchInput("");
    onUpdateParams({
      status: "all",
      sort: "new",
      startDate: null,
      endDate: null,
      slug: null, // Xóa slug trên URL
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
                Xem, chỉnh sửa và quản lý toàn bộ các danh mục chủ đề.
              </p>
            </div>

            {/* THANH TÌM KIẾM THEO SLUG/TÊN */}
            <div className="flex items-center gap-3 flex-1 max-w-md ml-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  key={params.slug || "empty"}
                  placeholder="Tìm theo tên hoặc slug..."
                  className="pl-9 h-9"
                  defaultValue={params.slug || ""} // Dùng defaultValue thay vì value để gõ mượt hơn
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="flex-none">
                <CreateTopicDialog />
              </div>
            </div>
          </header>

          <AdminFilter
            statusValue={params.status}
            sortValue={params.sort}
            totalCount={pagination?.totalItems ?? 0}
            onUpdateParams={onUpdateParams}
            startDate={params.startDate}
            endDate={params.endDate}
            onReset={handleReset}
            sortOptions={TAXONOMY_SORT_OPTIONS}
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
