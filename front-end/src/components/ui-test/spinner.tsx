"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

const Spinner = React.forwardRef<
  React.ComponentRef<typeof Loader2Icon>,
  React.ComponentPropsWithoutRef<typeof Loader2Icon>
>(({ className, ...props }, ref) => {
  return (
    <Loader2Icon
      ref={ref}
      role="status"
      aria-label="Loading"
      data-slot="spinner"
      className={cn("size-4 animate-spin text-muted-foreground", className)}
      {...props}
    />
  );
});
Spinner.displayName = "Spinner";

export { Spinner };
