"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronRight } from "lucide-react";
import { useNavStore } from "@/stores/useNavStore";

interface QuickNavItemProps extends React.ComponentPropsWithoutRef<
  typeof Button
> {
  item: {
    label?: string;
    href?: string;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
  };
  showBorder?: boolean;
  isTrigger?: boolean;
}

export const QuickNavItem = forwardRef<HTMLButtonElement, QuickNavItemProps>(
  ({ item, showBorder, isTrigger = false, className, ...props }, ref) => {
    const activeLabel = useNavStore((state) => state.activeLabel);
    const isActive = activeLabel === item.label;

    // Thành phần giao diện chính của Button
    const ButtonContent = (
      <Button
        ref={ref}
        size="lg"
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 py-6 relative overflow-hidden",
          isActive && "text-primary font-bold",
          isTrigger && "rounded-none",
          className
        )}
        {...props}
      >
        {isActive && (
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
        )}

        <div
          className={cn(
            "rounded-md p-1.5 ring-1 ring-border shrink-0",
            item.iconBg,
            item.iconColor
          )}
        >
          <item.icon size={18} />
        </div>

        <span className={cn("text-[16px] flex-1 text-left truncate")}>
          {item.label}
        </span>

        {isTrigger && (
          <ChevronRight
            size={18}
            className="ml-auto transition-transform duration-200 text-muted-foreground group-data-[state=open]/collapsible:rotate-90"
          />
        )}
      </Button>
    );

    // Nếu là Trigger (cho Collapsible), trả về Button trực tiếp để CollapsibleTrigger asChild hoạt động
    if (isTrigger) {
      return ButtonContent;
    }

    // Nếu là Item bình thường, bọc trong Link và Div (để hiển thị border)
    return (
      <div className="w-full">
        {showBorder && <div className="border-t mx-2 my-1 opacity-50" />}
        <Link href={item.href || "#"} className="block w-full">
          {ButtonContent}
        </Link>
      </div>
    );
  }
);

QuickNavItem.displayName = "QuickNavItem";
