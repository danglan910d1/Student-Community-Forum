import { Card, CardHeader } from "@/components/ui/card";

export function PostItemSkeleton() {
  return (
    <Card className="p-4 border-gray-100 shadow-md border border-solid animate-pulse">
      <CardHeader className="p-0 gap-0">
        {/* Giả lập tiêu đề bài viết */}
        <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3"></div>

        {/* Giả lập nội dung (3 dòng) */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
        </div>

        {/* Giả lập Metadata (Tác giả & Tags) */}
        <div className="text-xs mt-4 flex justify-between items-center border-t border-gray-50 pt-3">
          <div className="h-3 bg-gray-100 rounded w-1/4"></div>

          <div className="flex gap-1.5">
            <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
            <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
