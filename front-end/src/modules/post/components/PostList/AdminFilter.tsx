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
  isMine?: boolean;
}

export const AdminFilter = ({
  statusValue,
  sortValue,
  totalCount,
  startDate,
  endDate,
  onUpdateParams,
  onReset,
}: AdminContentFilterProps) => {
  const isAnyFilterActive =
    statusValue !== "all" || sortValue !== "new" || !!startDate;

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Hàng 1: Trạng thái */}
      <ContentFilter
        titlePrefix={"Trạng thái"}
        totalCount={totalCount}
        options={MY_POST_FILTERS}
        currentValue={statusValue}
        onFilterChange={(val) => onUpdateParams({ status: val, page: 1 })}
        className="mb-0"
      />

      {/* Hàng 2: Sắp xếp & Ngày tháng */}
      <div className="flex items-center justify-between border-t pt-4">
        <ContentFilter
          titlePrefix="Sắp xếp theo"
          totalCount={totalCount}
          options={POST_FILTERS}
          currentValue={sortValue}
          onFilterChange={(val) => onUpdateParams({ sort: val, page: 1 })}
          startDate={startDate}
          endDate={endDate}
          onDateChange={(range) => onUpdateParams({ ...range, page: 1 })}
          className="mb-0 flex-1"
        />

        {/* NÚT RESET TỔNG: Nằm tách biệt để quản lý cả 2 hàng */}
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
