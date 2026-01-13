"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  isPending?: boolean;
  className?: string;
  showCount?: boolean;
}

export function LikeButton({
  isLiked,
  likesCount,
  onLike,
  isPending,
  className,
  showCount = true,
}: LikeButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        onLike();
      }}
      className={cn(
        "group flex items-center gap-1.5 h-8 px-2.5 rounded-full transition-all active:scale-95",
        isLiked
          ? "text-pink-600 hover:bg-pink-50 hover:text-pink-700"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        className
      )}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-all duration-300",
          isLiked ? "fill-pink-600 scale-110" : "group-hover:scale-110"
        )}
      />
      {showCount && (
        <span className={cn("text-sm font-bold", isLiked && "text-pink-600")}>
          {likesCount.toLocaleString()}
        </span>
      )}
    </Button>
  );
}
