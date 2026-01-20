// modules/user/components/UserList/UserTableSection.tsx
"use client";

import { useCallback, useState, useEffect } from "react";
import { CardLayout } from "@/components/layout/CardLayout";
import { PaginationSection } from "@/components/shared/PaginationSection";
import { UserDataTable } from "./UserDataTable";
import { IUser } from "../../types";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminFilter } from "@/modules/post/components/PostList/AdminFilter";

const USER_ROLE_OPTIONS = [
  { label: "Tất cả vai trò", value: "all" },
  { label: "Quản trị viên", value: "admin" },
  { label: "Thành viên", value: "user" },
];

interface UserTableSectionProps {
  users: IUser[];
  params: {
    page: number;
    status: string;
    role: string;
    startDate?: string;
    endDate?: string;
    email?: string; // Giả sử dùng email hoặc name làm search
  };
  pagination?: { totalPages: number; totalItems: number };
  isFetching: boolean;
  onUpdateParams: (next: Record<string, string | number | null>) => void;
}

export function UserTableSection({
  users,
  params,
  pagination,
  isFetching,
  onUpdateParams,
}: UserTableSectionProps) {
  // Local state cho ô search để gõ mượt hơn
  const [searchInput, setSearchInput] = useState(params.email || "");

  const handleReset = useCallback(() => {
    setSearchInput("");
    onUpdateParams({
      status: "all",
      role: "all",
      startDate: null,
      endDate: null,
      email: null,
      page: 1,
    });
  }, [onUpdateParams]);

  return (
    <main className="animate-in fade-in duration-500 w-full flex flex-col h-[850px]">
      <CardLayout className="p-0 border shadow-sm overflow-hidden flex flex-col h-full bg-card">
        <div className="px-6 pt-6 flex-none border-b pb-4">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold uppercase text-primary">
                Quản trị người dùng
              </h2>
              <p className="text-sm text-muted-foreground">
                Quản lý tài khoản và phân quyền hệ thống.
              </p>
            </div>

            {/* Ô TÌM KIẾM THEO TÊN/EMAIL */}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                className="pl-9 h-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onUpdateParams({ email: searchInput, page: 1 });
                  }
                }}
              />
            </div>
          </header>

          <AdminFilter
            hideStatus={true} // ẨN HÀNG STATUS KHÔNG PHÙ HỢP
            statusValue={params.status}
            sortValue={params.role}
            totalCount={pagination?.totalItems ?? 0}
            onUpdateParams={(next) => {
              const formattedNext = { ...next };
              if (formattedNext.sort) {
                formattedNext.role = formattedNext.sort;
                delete formattedNext.sort;
              }
              onUpdateParams(formattedNext);
            }}
            startDate={params.startDate}
            endDate={params.endDate}
            onReset={handleReset}
            sortOptions={USER_ROLE_OPTIONS}
          />
        </div>

        <div className="flex-1 overflow-hidden px-4 py-2">
          {isFetching ? <TableSkeleton /> : <UserDataTable users={users} />}
        </div>

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
