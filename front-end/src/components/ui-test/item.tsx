"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// --- ItemGroup ---
const ItemGroup = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="list"
    data-slot="item-group"
    className={cn("group/item-group flex flex-col", className)}
    {...props}
  />
));
ItemGroup.displayName = "ItemGroup";

// --- ItemSeparator ---
const ItemSeparator = React.forwardRef<
  React.ComponentRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator
    ref={ref}
    data-slot="item-separator"
    className={cn("mx-auto my-0 w-[calc(100%-2rem)]", className)}
    {...props}
  />
));
ItemSeparator.displayName = "ItemSeparator";

// --- Item ---
const itemVariants = cva(
  "group/item relative flex flex-wrap items-center outline-none transition-colors duration-100",
  {
    variants: {
      variant: {
        default: "hover:bg-accent/50 focus-visible:bg-accent",
        outline: "border-border border bg-background",
        muted: "bg-muted/50",
      },
      size: {
        default: "gap-4 p-4",
        sm: "gap-3 px-4 py-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Item = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div"> &
    VariantProps<typeof itemVariants> & { asChild?: boolean }
>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        data-slot="item"
        data-variant={variant}
        data-size={size}
        className={cn(itemVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Item.displayName = "Item";

// --- ItemMedia ---
const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-muted-foreground size-9 rounded-lg border [&_svg:not([class*='size-'])]:size-5",
        image:
          "size-10 overflow-hidden rounded-md [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const ItemMedia = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & VariantProps<typeof itemMediaVariants>
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-media"
    className={cn(itemMediaVariants({ variant, className }))}
    {...props}
  />
));
ItemMedia.displayName = "ItemMedia";

// --- ItemContent ---
const ItemContent = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-content"
    className={cn("flex flex-1 flex-col gap-0.5 min-w-0", className)}
    {...props}
  />
));
ItemContent.displayName = "ItemContent";

// --- ItemTitle ---
const ItemTitle = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-title"
    className={cn("text-sm font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
ItemTitle.displayName = "ItemTitle";

// --- ItemDescription ---
const ItemDescription = React.forwardRef<
  React.ComponentRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="item-description"
    className={cn("text-muted-foreground text-sm line-clamp-2", className)}
    {...props}
  />
));
ItemDescription.displayName = "ItemDescription";

// --- ItemActions ---
const ItemActions = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="item-actions"
    className={cn("ml-auto flex items-center gap-2", className)}
    {...props}
  />
));
ItemActions.displayName = "ItemActions";

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
};
