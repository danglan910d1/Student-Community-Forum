import { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface TagItemProps {
  icon: LucideIcon;
  name: string;
  count: string;
  isTrending?: boolean;
  colorClass: string;
}

export const TagItem = ({
  icon: Icon,
  name,
  count,
  isTrending,
  colorClass,
}: TagItemProps) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <Button
      // SỬ DỤNG NGUYÊN BẢN VARIANT CỦA BẠN
      variant="ghost"
      // CHỈ ĐIỀU CHỈNH LAYOUT, KHÔNG ĐỔI MÀU SẮC
      className={cn(
        "w-full h-auto justify-start items-center p-2 border-b border-gray-50 last:border-0 hover:text-blue-700",
        "transition-all"
      )}
    >
      {/* 1. Icon Wrapper - Giữ nguyên vì đây là style riêng của Tag */}
      <div
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0",
          colorMap[colorClass] || colorMap.blue
        )}
      >
        <Icon size={16} />
      </div>

      {/* 2. Content Area */}
      <div className="flex flex-col items-start min-w-0">
        <span className="text-sm bold truncate">#{name}</span>
        <span className="text-[11px] text-gray-500 font-normal truncate">
          {count} bài đăng
          {isTrending && (
            <>
              {" "}
              •{" "}
              <span className="text-green-600 font-medium">
                Đang thịnh hành
              </span>
            </>
          )}
        </span>
      </div>
    </Button>
  );
};
