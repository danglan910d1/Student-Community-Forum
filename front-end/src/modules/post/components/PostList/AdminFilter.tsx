import { ContentFilter } from "@/components/shared/FilterMenu";
import { MY_POST_FILTERS, POST_FILTERS } from "../../constants/post";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminContentFilterProps {
  statusValue: string;
  sortValue: string;
  totalCount: number;
  onUpdateParams: (next: Record<string, string | number | null>) => void;
  startDate?: string;
  endDate?: string;
  onReset?: () => void;
  // Options linh hoạt: Nếu không truyền sẽ lấy mặc định từ Post
  statusOptions?: { label: string; value: string }[];
  sortOptions?: { label: string; value: string }[];
  hideStatus?: boolean;
}

export const AdminFilter = ({
  statusValue,
  sortValue,
  totalCount,
  startDate,
  endDate,
  onUpdateParams,
  onReset,
  statusOptions = MY_POST_FILTERS, // Mặc định Post status
  sortOptions = POST_FILTERS, // Mặc định Post sorting
  hideStatus = false,
}: AdminContentFilterProps) => {
  // Logic kiểm tra để hiện nút "Đặt lại"
  const isAnyFilterActive =
    statusValue !== "all" || sortValue !== "new" || !!startDate || !!endDate;

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Hàng 1: Trạng thái (Approved, Pending, Rejected...) */}
      {!hideStatus && (
        <ContentFilter
          titlePrefix={"Trạng thái"}
          totalCount={totalCount}
          options={statusOptions}
          currentValue={statusValue}
          onFilterChange={(val) => onUpdateParams({ status: val, page: 1 })}
          className="mb-0"
        />
      )}
      {/* Hàng 2: Sắp xếp (New, Popular...) & Lọc theo ngày */}
      <div className="flex items-center justify-between border-t pt-4">
        <ContentFilter
          titlePrefix="Sắp xếp theo"
          totalCount={totalCount}
          options={sortOptions}
          currentValue={sortValue}
          onFilterChange={(val) => onUpdateParams({ sort: val, page: 1 })}
          startDate={startDate}
          endDate={endDate}
          onDateChange={(range) => onUpdateParams({ ...range, page: 1 })}
          className="mb-0 flex-1"
        />

        {/* Nút Reset */}
        {isAnyFilterActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            <span className="text-xs">Đặt lại</span>
          </Button>
        )}
      </div>
    </div>
  );
};
