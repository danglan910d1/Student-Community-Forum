// app/(main)/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    // Sử dụng bg-transparent để nó hòa nhập hoàn toàn vào màu nền của MainLayout
    <div className="w-full h-full space-y-8 p-6 lg:p-10 bg-transparent">
      {/* 1. Tiêu đề trang giả lập */}
      <div className="space-y-3">
        {/* h-10 khớp với các tiêu đề lớn, h-4 cho sub-title */}
        <Skeleton className="h-10 w-1/3 bg-muted" />
        <Skeleton className="h-4 w-1/2 bg-muted/60" />
      </div>

      {/* 2. Danh sách bài viết giả lập (Khớp hoàn hảo với PostItem của bạn) */}
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            {/* Phần nội dung bài viết */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4 bg-muted" /> {/* Title */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-muted/50" /> {/* Line 1 */}
                <Skeleton className="h-4 w-2/3 bg-muted/50" /> {/* Line 2 */}
              </div>
            </div>

            {/* Phần Footer của Card bài viết */}
            <div className="flex justify-between items-center border-t border-border pt-4">
              {/* Bên trái: Thông tin tác giả & Thống kê */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24 bg-muted/70" />
                </div>
                <Skeleton className="h-4 w-16 bg-muted/70" />
              </div>

              {/* Bên phải: Tags */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full bg-muted" />
                <Skeleton className="h-6 w-16 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
