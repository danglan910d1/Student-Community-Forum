"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react";

const Combobox = ComboboxPrimitive.Root;

// --- Components Chính ---

const ComboboxTrigger = React.forwardRef<
  React.ComponentRef<"button">,
  ComboboxPrimitive.Trigger.Props
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.Trigger
    ref={ref}
    data-slot="combobox-trigger"
    className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
    {...props}
  >
    {children}
    <ChevronDownIcon className="text-muted-foreground size-4 pointer-events-none" />
  </ComboboxPrimitive.Trigger>
));
ComboboxTrigger.displayName = "ComboboxTrigger";

const ComboboxInput = React.forwardRef<
  React.ComponentRef<"input">,
  ComboboxPrimitive.Input.Props & {
    showTrigger?: boolean;
    showClear?: boolean;
  }
>(
  (
    {
      className,
      children,
      disabled = false,
      showTrigger = true,
      showClear = false,
      ...props
    },
    ref
  ) => (
    <InputGroup className={cn("w-auto", className)}>
      <ComboboxPrimitive.Input
        ref={ref}
        render={
          <InputGroupInput disabled={disabled} data-slot="combobox-input" />
        }
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            asChild
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          >
            <ComboboxTrigger />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
);
ComboboxInput.displayName = "ComboboxInput";

const ComboboxContent = React.forwardRef<
  React.ComponentRef<"div">,
  ComboboxPrimitive.Popup.Props &
    Pick<
      ComboboxPrimitive.Positioner.Props,
      "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
    >
>(
  (
    {
      className,
      side = "bottom",
      sideOffset = 6,
      align = "start",
      alignOffset = 0,
      anchor,
      ...props
    },
    ref
  ) => (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          ref={ref}
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            "bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-h-72 min-w-36 overflow-hidden rounded-md shadow-md ring-1 ring-foreground/10 duration-100 group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) data-[chips=true]:min-w-(--anchor-width)",
            className
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
);
ComboboxContent.displayName = "ComboboxContent";

const ComboboxItem = React.forwardRef<
  React.ComponentRef<"div">,
  ComboboxPrimitive.Item.Props
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.Item
    ref={ref}
    data-slot="combobox-item"
    className={cn(
      "data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  >
    {children}
    <ComboboxPrimitive.ItemIndicator
      render={
        <span
          data-slot="combobox-item-indicator"
          className="pointer-events-none absolute right-2 flex size-4 items-center justify-center"
        />
      }
    >
      <CheckIcon className="pointer-events-none" />
    </ComboboxPrimitive.ItemIndicator>
  </ComboboxPrimitive.Item>
));
ComboboxItem.displayName = "ComboboxItem";

// --- Sub-components (Sử dụng render prop để tránh lỗi ref) ---

const ComboboxValue = (props: ComboboxPrimitive.Value.Props) => (
  <ComboboxPrimitive.Value {...props} data-slot="combobox-value" />
);

ComboboxValue.displayName = "ComboboxValue";

const ComboboxClear = React.forwardRef<
  React.ComponentRef<"button">,
  ComboboxPrimitive.Clear.Props
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Clear
    {...props}
    data-slot="combobox-clear"
    className={cn(className)}
    render={
      <InputGroupButton ref={ref} variant="ghost" size="icon-xs">
        <XIcon className="pointer-events-none" />
      </InputGroupButton>
    }
  />
));
ComboboxClear.displayName = "ComboboxClear";

const ComboboxList = React.forwardRef<
  React.ComponentRef<"div">,
  ComboboxPrimitive.List.Props
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.List
    {...props}
    render={
      <div
        ref={ref}
        data-slot="combobox-list"
        className={cn(
          "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto p-1 data-empty:p-0 overscroll-contain",
          className
        )}
      />
    }
  />
));
ComboboxList.displayName = "ComboboxList";

const ComboboxGroup = React.forwardRef<
  React.ComponentRef<"div">,
  ComboboxPrimitive.Group.Props
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Group
    {...props}
    render={
      <div ref={ref} data-slot="combobox-group" className={cn(className)} />
    }
  />
));
ComboboxGroup.displayName = "ComboboxGroup";

const ComboboxLabel = React.forwardRef<
  React.ComponentRef<"div">,
  ComboboxPrimitive.GroupLabel.Props
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.GroupLabel
    {...props}
    render={
      <div
        ref={ref}
        data-slot="combobox-label"
        className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      />
    }
  />
));
ComboboxLabel.displayName = "ComboboxLabel";

const ComboboxEmpty = React.forwardRef<
  React.ComponentRef<"div">,
  ComboboxPrimitive.Empty.Props
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Empty
    {...props}
    render={
      <div
        ref={ref}
        data-slot="combobox-empty"
        className={cn(
          "text-muted-foreground hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex",
          className
        )}
      />
    }
  />
));
ComboboxEmpty.displayName = "ComboboxEmpty";

const ComboboxSeparator = React.forwardRef<
  React.ComponentRef<"div">,
  ComboboxPrimitive.Separator.Props
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Separator
    {...props}
    render={
      <div
        ref={ref}
        data-slot="combobox-separator"
        className={cn("bg-border -mx-1 my-1 h-px", className)}
      />
    }
  />
));
ComboboxSeparator.displayName = "ComboboxSeparator";

const ComboboxChips = React.forwardRef<
  React.ComponentRef<"div">,
  ComboboxPrimitive.Chips.Props
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Chips
    {...props}
    render={
      <div
        ref={ref}
        data-slot="combobox-chips"
        className={cn(
          "dark:bg-input/30 border-input focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive dark:has-aria-invalid:border-destructive/50 flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-transparent bg-clip-padding px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:ring-[3px] has-aria-invalid:ring-[3px] has-data-[slot=combobox-chip]:px-1.5",
          className
        )}
      />
    }
  />
));
ComboboxChips.displayName = "ComboboxChips";

const ComboboxChip = React.forwardRef<
  React.ComponentRef<"div">,
  ComboboxPrimitive.Chip.Props & { showRemove?: boolean }
>(({ className, children, showRemove = true, ...props }, ref) => (
  <ComboboxPrimitive.Chip
    {...props}
    render={
      <div
        ref={ref}
        data-slot="combobox-chip"
        className={cn(
          "bg-muted text-foreground flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap has-data-[slot=combobox-chip-remove]:pr-0 has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
          className
        )}
      >
        {children}
        {showRemove && (
          <ComboboxPrimitive.ChipRemove
            render={
              <Button
                variant="ghost"
                size={"sm"}
                className="-ml-1 opacity-50 hover:opacity-100"
                data-slot="combobox-chip-remove"
              />
            }
          >
            <XIcon className="pointer-events-none" />
          </ComboboxPrimitive.ChipRemove>
        )}
      </div>
    }
  />
));
ComboboxChip.displayName = "ComboboxChip";

const ComboboxChipsInput = React.forwardRef<
  React.ComponentRef<"input">,
  ComboboxPrimitive.Input.Props
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Input
    ref={ref}
    render={
      <input
        data-slot="combobox-chip-input"
        className={cn("min-w-16 flex-1 outline-none bg-transparent", className)}
      />
    }
    {...props}
  />
));
ComboboxChipsInput.displayName = "ComboboxChipsInput";

const ComboboxCollection = ComboboxPrimitive.Collection;

function useComboboxAnchor() {
  return React.useRef<React.ComponentRef<"div"> | null>(null);
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
