// src/modules/auth/components/shared/AuthSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthSkeleton() {
  return (
    // Bỏ animate-pulse ở ngoài vì component Skeleton của Shadcn đã có sẵn rồi
    <div className="flex flex-col gap-6 w-full py-2">
      {/* 1. Header: Khớp với font size của tiêu đề thật */}
      <div className="flex flex-col items-center gap-3 text-center mb-4">
        <Skeleton className="h-9 w-3/4 bg-muted/80" /> {/* Tiêu đề chính */}
        <Skeleton className="h-4 w-full bg-muted/60" /> {/* Dòng mô tả */}
      </div>

      {/* 2. Form Fields */}
      <div className="space-y-5">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24 bg-muted/60" /> {/* Label */}
            <Skeleton className="h-11 w-full rounded-md bg-muted/40" />{" "}
            {/* Input */}
          </div>
        ))}
      </div>

      {/* 3. Button & Footer */}
      <div className="space-y-4 mt-2">
        <Skeleton className="h-11 w-full rounded-md bg-primary/20" />{" "}
        {/* Button */}
        <div className="flex justify-center">
          <Skeleton className="h-4 w-40 bg-muted/60" /> {/* Link redirect */}
        </div>
      </div>
    </div>
  );
}
