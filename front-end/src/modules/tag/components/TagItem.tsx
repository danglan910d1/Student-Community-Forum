import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TagItemProps {
  icon: LucideIcon;
  name: string;
  count: string;
  isTrending?: boolean;
  colorClass: string;
  isActive?: boolean; // Thêm prop isActive
}

export const TagItem = ({
  icon: Icon,
  name,
  count,
  isTrending,
  colorClass,
  isActive, // Nhận prop isActive
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
      variant={isActive ? "secondary" : "ghost"} // Đổi sang secondary khi active giống QuickNavItem
      className={cn(
        "w-full h-auto justify-start items-center p-2 border-b border-gray-50 last:border-0 relative overflow-hidden group",
        "transition-all duration-200",
        isActive && "text-primary font-bold bg-secondary"
      )}
    >
      {/* Vạch kẻ dọc bên phải/trái khi active giống QuickNavItem */}
      {isActive && (
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
      )}

      {/* 1. Icon Wrapper */}
      <div
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 mr-3 transition-transform group-hover:scale-110",
          colorMap[colorClass] || colorMap.blue
        )}
      >
        <Icon size={16} />
      </div>

      {/* 2. Content Area */}
      <div className="flex flex-col items-start min-w-0">
        <span className="text-sm font-semibold truncate">#{name}</span>
        <span
          className={cn(
            "text-xs font-normal truncate",
            isActive ? "text-primary/70" : "text-gray-500"
          )}
        >
          {count} bài đăng
          {isTrending && (
            <>
              {" "}
              • <span className="text-green-600 font-medium">Thịnh hành</span>
            </>
          )}
        </span>
      </div>
    </Button>
  );
};
