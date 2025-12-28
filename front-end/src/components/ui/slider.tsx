"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    data-slot="slider"
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      "data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      data-slot="slider-track"
      className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20"
    >
      <SliderPrimitive.Range
        data-slot="slider-range"
        className="absolute h-full bg-primary"
      />
    </SliderPrimitive.Track>
    {/* Map qua mảng giá trị để render Thumb, hỗ trợ Slider Range (nhiều nút kéo) */}
    {(props.value || props.defaultValue || [0]).map((_, index) => (
      <SliderPrimitive.Thumb
        key={index}
        data-slot="slider-thumb"
        className={cn(
          "block size-4 rounded-full border border-primary/50 bg-background shadow-sm transition-all outline-none",
          "focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:pointer-events-none"
        )}
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
