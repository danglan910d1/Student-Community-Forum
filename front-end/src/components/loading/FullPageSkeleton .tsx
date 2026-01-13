// app/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function FullPageSkeleton() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* 1. Header giả lập - Sử dụng màu nền và border hệ thống */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32 bg-muted" /> {/* Logo */}
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Skeleton className="h-4 w-16 bg-muted/60" />
            <Skeleton className="h-8 w-[400px] rounded-md bg-muted/40" />{" "}
            {/* Search */}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full bg-muted" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 2. Sidebar trái giả lập */}
        <aside className="hidden w-[280px] border-r border-border bg-card/50 p-4 lg:block shrink-0">
          <div className="space-y-6">
            {/* Menu chính */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-lg bg-muted/80" />
              <Skeleton className="h-10 w-full rounded-lg bg-muted/80" />
            </div>

            {/* Section Popular Tags */}
            <div className="space-y-4 pt-4">
              <Skeleton className="h-4 w-24 bg-muted" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg bg-muted" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-20 bg-muted" />
                    <Skeleton className="h-2 w-12 bg-muted/40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 3. Nội dung chính - Dạng danh sách (List) */}
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header nội dung */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Skeleton className="h-8 w-48 bg-muted" />
              <Skeleton className="h-9 w-24 rounded-md bg-muted" />
            </div>

            {/* List các bài viết giả lập */}
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4 bg-muted" /> {/* Title */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full bg-muted/50" />
                      <Skeleton className="h-4 w-5/6 bg-muted/50" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border mt-4">
                    <div className="flex items-center gap-4 mt-2">
                      <Skeleton className="h-4 w-24 bg-muted/60" />
                      <Skeleton className="h-4 w-16 bg-muted/60" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-6 w-16 rounded-full bg-muted/80" />
                      <Skeleton className="h-6 w-16 rounded-full bg-muted/80" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
