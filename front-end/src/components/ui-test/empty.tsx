"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// --- Empty Root ---
const Empty = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="empty"
    className={cn(
      "flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-lg border border-dashed p-8 text-center animate-in fade-in-50",
      className
    )}
    {...props}
  />
));
Empty.displayName = "Empty";

// --- Empty Header ---
const EmptyHeader = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="empty-header"
    className={cn("flex max-w-[420px] flex-col items-center gap-2", className)}
    {...props}
  />
));
EmptyHeader.displayName = "EmptyHeader";

// --- Empty Media ---
const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-muted-foreground size-12 rounded-full [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const EmptyMedia = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div"> &
    VariantProps<typeof emptyMediaVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="empty-media"
    className={cn(emptyMediaVariants({ variant, className }))}
    {...props}
  />
));
EmptyMedia.displayName = "EmptyMedia";

// --- Empty Title ---
const EmptyTitle = React.forwardRef<
  React.ComponentRef<"h3">,
  React.ComponentPropsWithoutRef<"h3">
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-slot="empty-title"
    className={cn("text-xl font-semibold tracking-tight", className)}
    {...props}
  />
));
EmptyTitle.displayName = "EmptyTitle";

// --- Empty Description ---
const EmptyDescription = React.forwardRef<
  React.ComponentRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="empty-description"
    className={cn(
      "text-muted-foreground text-sm max-w-[320px] leading-relaxed",
      className
    )}
    {...props}
  />
));
EmptyDescription.displayName = "EmptyDescription";

// --- Empty Content ---
const EmptyContent = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="empty-content"
    className={cn("flex items-center justify-center w-full", className)}
    {...props}
  />
));
EmptyContent.displayName = "EmptyContent";

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
};
