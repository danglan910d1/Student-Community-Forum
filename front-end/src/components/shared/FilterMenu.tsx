// components/shared/ContentFilter.tsx
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

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
}

export const ContentFilter = ({
  titlePrefix = "Tổng số bài Post",
  totalCount,
  options,
  currentValue,
  onFilterChange,
  className,
}: ContentFilterProps) => {
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
      </div>
    </div>
  );
};
