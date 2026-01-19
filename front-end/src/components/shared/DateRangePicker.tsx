// components/shared/DateRangePicker.tsx
"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className,
}: DateRangePickerProps) {
  // Logic hiển thị lịch dựa trên props
  const date: DateRange | undefined = React.useMemo(() => {
    if (!startDate) return undefined;
    try {
      const from = parseISO(startDate);
      const to = endDate ? parseISO(endDate) : undefined;
      return { from, to };
    } catch (e) {
      return undefined;
    }
  }, [startDate, endDate]);

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      const startStr = format(range.from, "yyyy-MM-dd");
      // Tối ưu: Click 1 lần chọn luôn 1 ngày (start = end)
      const endStr = range.to ? format(range.to, "yyyy-MM-dd") : startStr;

      onChange({
        startDate: startStr,
        endDate: endStr,
      });
    } else {
      // Khi người dùng click bỏ chọn trên lịch
      onChange({ startDate: "", endDate: "" });
    }
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn Popover mở ra khi click X
    // Gửi giá trị rỗng để URL xóa param startDate/endDate
    onChange({ startDate: "", endDate: "" });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "justify-start text-left font-normal h-9 px-3",
              !startDate && !endDate
                ? "w-10 px-0 justify-center"
                : "w-auto min-w-[150px]",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className={cn("h-4 w-4", startDate && "mr-2")} />

            {date?.from && (
              <span className="text-xs">
                {date.to && date.to !== date.from ? (
                  <>
                    {format(date.from, "dd/MM")} - {format(date.to, "dd/MM")}
                  </>
                ) : (
                  format(date.from, "dd/MM")
                )}
              </span>
            )}

            {/* Nút X để xóa nhanh */}
            {startDate && (
              <div
                role="button"
                onClick={clearDate}
                className="ml-auto pl-2 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3 opacity-50 hover:opacity-100" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from || new Date()}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
