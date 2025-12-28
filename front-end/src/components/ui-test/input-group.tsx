"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// --- Root Component ---
const InputGroup = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="input-group"
    role="group"
    className={cn(
      "group/input-group border-input shadow-xs relative flex w-full items-center rounded-md border outline-none transition-[color,box-shadow]",
      "h-9 has-[textarea]:h-auto",
      "has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1",
      "has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-destructive/20",
      className
    )}
    {...props}
  />
));
InputGroup.displayName = "InputGroup";

// --- Addon / Content Components ---
const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
        "inline-end":
          "order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]",
        "block-start": "order-first w-full justify-start px-3 pt-3",
        "block-end": "order-last w-full justify-start px-3 pb-3",
      },
    },
    defaultVariants: { align: "inline-start" },
  }
);

const InputGroupAddon = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div"> &
    VariantProps<typeof inputGroupAddonVariants>
>(({ className, align, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="input-group-addon"
    data-align={align}
    className={cn(inputGroupAddonVariants({ align }), className)}
    onClick={(e) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const input = e.currentTarget.parentElement?.querySelector<
        HTMLInputElement | HTMLTextAreaElement
      >("[data-slot=input-group-control]");
      input?.focus();
    }}
    {...props}
  />
));
InputGroupAddon.displayName = "InputGroupAddon";

const InputGroupText = React.forwardRef<
  React.ComponentRef<"span">,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="input-group-text"
    className={cn(
      "text-muted-foreground flex items-center justify-center px-1 text-sm font-normal tabular-nums select-none",
      className
    )}
    {...props}
  />
));
InputGroupText.displayName = "InputGroupText";

const InputGroupButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, "size"> & {
    size?: "xs" | "sm" | "icon-xs" | "icon-sm";
  }
>(({ className, variant = "ghost", size = "xs", ...props }, ref) => (
  <Button
    ref={ref}
    variant={variant}
    className={cn(
      "flex items-center gap-2 text-sm shadow-none",
      size === "xs" && "h-6 px-2 rounded-[calc(var(--radius)-5px)]",
      size === "sm" && "h-8 px-2.5",
      size === "icon-xs" && "size-6 p-0",
      size === "icon-sm" && "size-8 p-0",
      className
    )}
    {...props}
  />
));
InputGroupButton.displayName = "InputGroupButton";

// --- Control Components ---
const InputGroupInput = React.forwardRef<
  React.ComponentRef<typeof Input>,
  React.ComponentPropsWithoutRef<typeof Input>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    data-slot="input-group-control"
    className={cn(
      "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0",
      className
    )}
    {...props}
  />
));
InputGroupInput.displayName = "InputGroupInput";

const InputGroupTextarea = React.forwardRef<
  React.ComponentRef<typeof Textarea>,
  React.ComponentPropsWithoutRef<typeof Textarea>
>(({ className, ...props }, ref) => (
  <Textarea
    ref={ref}
    data-slot="input-group-control"
    className={cn(
      "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0",
      className
    )}
    {...props}
  />
));
InputGroupTextarea.displayName = "InputGroupTextarea";

export {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
};
