"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenericDropdownProps {
  label: string;
  items: { label: string; value: string }[];
  onSelect?: (value: string) => void;
  activeValue?: string;
  className?: string;
}

export const GenericDropdown = ({
  label,
  items,
  onSelect,
  activeValue,
  className,
}: GenericDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between w-full text-md focus-visible:ring-0",
            className,
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuRadioGroup value={activeValue} onValueChange={onSelect}>
          {items.map((item) => {
            const isSelected = activeValue === item.value;

            return (
              <DropdownMenuRadioItem
                key={item.value}
                value={item.value}
                // Custom style để giống QuickNavigation
                className={cn(
                  "py-3 cursor-pointer relative transition-colors text-md",
                  "[&>span]:hidden",
                  isSelected && "bg-accent text-primary font-bold",
                )}
              >
                {item.label}

                {isSelected && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
                )}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
