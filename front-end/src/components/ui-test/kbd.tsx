"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Kbd = React.forwardRef<
  React.ComponentRef<"kbd">,
  React.ComponentPropsWithoutRef<"kbd">
>(({ className, ...props }, ref) => (
  <kbd
    ref={ref}
    data-slot="kbd"
    className={cn(
      // Style cơ bản: Bo góc nhỏ, font sans-serif chuyên dụng cho phím tắt
      "bg-muted text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm px-1 font-sans text-[10px] font-medium border shadow-[0_1px_0_0_rgba(0,0,0,0.1)]",
      // Tự động điều chỉnh kích thước icon bên trong
      "[&_svg:not([class*='size-'])]:size-3",
      // Logic thích nghi: Nếu nằm trong Tooltip (nền tối) thì tự đổi màu để dễ đọc
      "[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-primary-foreground dark:[[data-slot=tooltip-content]_&]:bg-background/10",
      className
    )}
    {...props}
  />
));
Kbd.displayName = "Kbd";

const KbdGroup = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="kbd-group"
    className={cn("inline-flex items-center gap-1", className)}
    {...props}
  />
));
KbdGroup.displayName = "KbdGroup";

export { Kbd, KbdGroup };
