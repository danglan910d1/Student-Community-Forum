"use client";

import { useCallback, useState } from "react";
import { CardLayout } from "@/components/layout/CardLayout";
import { PaginationSection } from "@/components/shared/PaginationSection";
import { AdminFilter } from "@/modules/post/components/PostList/AdminFilter";
import { TagDataTable } from "./TagDataTable";
import { ITag } from "../../types";
import { CreateTagDialog } from "../TagForm/CreateTagDialog";
import { TAXONOMY_SORT_OPTIONS } from "@/modules/topic/constants/topic";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TagTableSectionProps {
  tags: ITag[];
  params: {
    page: number;
    status: string;
    sort: string;
    startDate?: string;
    endDate?: string;
    slug?: string;
  };
  pagination?: { totalPages: number; totalItems: number };
  pendingCount: number;
  isFetching: boolean;
  onUpdateParams: (next: Record<string, string | number | null>) => void;
}

export function TagTableSection({
  tags,
  params,
  pagination,
  isFetching,
  onUpdateParams,
  pendingCount,
}: TagTableSectionProps) {
  const [searchInput, setSearchInput] = useState(params.slug || "");

  const handleReset = useCallback(() => {
    setSearchInput("");
    onUpdateParams({
      status: "all",
      sort: "new",
      startDate: null,
      endDate: null,
      slug: null, // Reset slug
      page: 1,
    });
  }, [onUpdateParams]);

  /**
   * Logic hiển thị số lượng chờ duyệt:
   * Nếu Backend của bạn trả về một field riêng như data.pendingCount thì dùng cái đó.
   * Nếu không, ta tạm thời lấy pagination.totalItems khi params.status === 'pending'
   */
  const totalCount = pagination?.totalItems ?? 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onUpdateParams({ slug: searchInput.trim() || null, page: 1 });
    }
  };

  return (
    <main className="animate-in fade-in duration-500 w-full min-w-0 h-[800px] flex flex-col">
      <CardLayout className="p-0 border shadow-sm overflow-hidden flex flex-col h-full w-full bg-card">
        {/* HEADER & FILTER */}
        <div className="px-6 pt-6 flex-none border-b pb-4">
          <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-primary">
                Quản trị thẻ (Tags)
              </h2>
              <p className="text-sm text-muted-foreground">
                Quản lý hệ thống nhãn dán và kiểm duyệt thẻ.
              </p>
            </div>

            {/* THANH TÌM KIẾM THEO SLUG */}
            <div className="flex items-center gap-3 flex-1 max-w-md ml-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  key={params.slug || "empty"} // Reset khi URL thay đổi
                  placeholder="Tìm theo tên hoặc slug..."
                  className="pl-9 h-9"
                  defaultValue={params.slug || ""}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="flex-none">
                <CreateTagDialog
                  onUpdateParams={onUpdateParams}
                  pendingCount={pendingCount}
                />
              </div>
            </div>
          </header>

          <AdminFilter
            statusValue={params.status}
            sortValue={params.sort}
            totalCount={totalCount}
            onUpdateParams={onUpdateParams}
            startDate={params.startDate}
            endDate={params.endDate}
            onReset={handleReset}
            sortOptions={TAXONOMY_SORT_OPTIONS}
          />
        </div>

        {/* TABLE AREA */}
        <div className="flex-1 overflow-hidden px-4 py-2">
          {isFetching ? <TableSkeleton /> : <TagDataTable tags={tags} />}
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
