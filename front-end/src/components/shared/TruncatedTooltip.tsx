// components/shared/TruncatedTooltip.tsx
"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TruncatedTooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
  maxLines?: number;
}

export function TruncatedTooltip({
  content,
  children,
  className,
  maxLines = 2,
}: TruncatedTooltipProps) {
  if (!content) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "cursor-help whitespace-normal break-words",
              maxLines === 1 ? "truncate" : "line-clamp-[var(--max-lines)]",
              className,
            )}
            style={{ "--max-lines": maxLines } as React.CSSProperties}
          >
            {children || content}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[300px] p-3 shadow-md">
          <p className="text-sm leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
