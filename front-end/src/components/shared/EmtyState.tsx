"use client";

import * as React from "react";
import { Inbox, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation"; // Import từ navigation
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string; // Thêm prop này để điều hướng SPA
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "Không có dữ liệu",
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const router = useRouter();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionHref) {
      router.push(actionHref);
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center animate-in fade-in zoom-in-95 duration-500",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>

      <h3 className="mt-4 text-xl font-semibold tracking-tight">{title}</h3>

      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-[300px] mx-auto">
          {description}
        </p>
      )}

      {actionLabel && (actionHref || onAction) && (
        <Button
          variant="outline"
          onClick={handleAction}
          className="mt-6 shadow-sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
