import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const SearchBar = ({ className = "" }: { className?: string }) => (
  <div className={`relative w-full ${className}`}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    <Input
      placeholder="Tìm kiếm bài viết, chủ đề, thành viên..."
      className="w-full text-md h-10 bg-gray-100 pl-10 focus:bg-white transition-all shadow-inner border-gray-200 focus:outline-none focus:ring-2 focus-visible:ring-2 border-none shadow-sm"
    />
  </div>
);
