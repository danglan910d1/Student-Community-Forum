"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const NativeSelect = React.forwardRef<
  React.ComponentRef<"select">,
  Omit<React.ComponentPropsWithoutRef<"select">, "size"> & {
    size?: "sm" | "default";
  }
>(({ className, size = "default", ...props }, ref) => {
  return (
    <div
      className="group/native-select relative w-full has-disabled:opacity-50"
      data-slot="native-select-wrapper"
    >
      <select
        ref={ref}
        data-slot="native-select"
        data-size={size}
        className={cn(
          // Base styles đồng bộ với Input
          "border-input placeholder:text-muted-foreground bg-transparent h-9 w-full min-w-0 appearance-none rounded-md border px-3 py-2 pr-9 text-sm shadow-xs transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed",
          // Sizing logic
          "data-[size=sm]:h-8 data-[size=sm]:py-1 data-[size=sm]:text-xs",
          // Focus states (Ring kiểu mới phù hợp Tailwind v4/v3.4+)
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          // Validation states
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          className
        )}
        {...props}
      />
      <ChevronDownIcon
        className={cn(
          "text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-50 select-none transition-transform group-focus-within/native-select:rotate-180",
          "group-has-[select[data-size=sm]]/native-select:right-2.5 group-has-[select[data-size=sm]]/native-select:size-3.5"
        )}
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
});
NativeSelect.displayName = "NativeSelect";

const NativeSelectOption = React.forwardRef<
  React.ComponentRef<"option">,
  React.ComponentPropsWithoutRef<"option">
>(({ ...props }, ref) => (
  <option
    ref={ref}
    data-slot="native-select-option"
    className="bg-popover text-popover-foreground"
    {...props}
  />
));
NativeSelectOption.displayName = "NativeSelectOption";

const NativeSelectOptGroup = React.forwardRef<
  React.ComponentRef<"optgroup">,
  React.ComponentPropsWithoutRef<"optgroup">
>(({ className, ...props }, ref) => (
  <optgroup
    ref={ref}
    data-slot="native-select-optgroup"
    className={cn("font-semibold not-italic", className)}
    {...props}
  />
));
NativeSelectOptGroup.displayName = "NativeSelectOptGroup";

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
