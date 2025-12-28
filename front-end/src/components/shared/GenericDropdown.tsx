"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenericDropdownProps {
  label: string;
  items: string[];
  onSelect?: (item: string) => void;
  className?: string;
  width?: string;
}

export const GenericDropdown = ({
  label,
  items,
  onSelect,
  className,
  width = "w-56",
}: GenericDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className={cn("text-md", className)}>
        {label} <ChevronDown className="ml-1" size={16} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className={width}>
      {items.map((item) => (
        <DropdownMenuItem
          key={item}
          className="text-md"
          onClick={() => onSelect?.(item)}
        >
          {item}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
