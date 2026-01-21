// components/shared/ContentFilter.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "./DateRangePicker";
import { RotateCcw } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface ContentFilterProps {
  titlePrefix?: string;
  totalCount: number;
  options: FilterOption[];
  currentValue: string;
  onFilterChange: (value: string) => void;
  className?: string;
  startDate?: string;
  endDate?: string;
  onDateChange?: (range: { startDate: string; endDate: string }) => void;
  defaultFilterValue?: string;
  onReset?: () => void;
}

export const ContentFilter = ({
  titlePrefix = "Tổng số bài Post",
  totalCount,
  options,
  currentValue,
  onFilterChange,
  className,
  startDate,
  endDate,
  onDateChange,
  defaultFilterValue,
  onReset,
}: ContentFilterProps) => {
  const isFiltered =
    (currentValue && currentValue !== defaultFilterValue) || !!startDate;
  return (
    <div className={cn("flex justify-between items-center mb-4", className)}>
      <div className="text-base">
        {titlePrefix} ({totalCount.toLocaleString()})
      </div>

      <div className="filter-buttons flex gap-2">
        {options.map((opt) => (
          <Button
            key={opt.value}
            variant={currentValue === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
        {onDateChange && (
          <div className="pl-3 border-l h-8 flex items-center">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={onDateChange}
            />
          </div>
        )}
        {onReset && isFiltered && (
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
