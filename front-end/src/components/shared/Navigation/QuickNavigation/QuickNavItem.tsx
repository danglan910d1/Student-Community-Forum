"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { LucideIcon } from "lucide-react";
import { useNavStore } from "@/stores/useNavStore";

interface QuickNavItemProps {
  item: {
    label: string;
    href: string;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
  };
  showBorder: boolean;
}

export const QuickNavItem = ({ item, showBorder }: QuickNavItemProps) => {
  // Chỉ lấy trạng thái từ Store
  const activeLabel = useNavStore((state) => state.activeLabel);
  const isActive = activeLabel === item.label;

  return (
    <div>
      {showBorder && <div className="border-t mx-2 my-1 opacity-50" />}
      <Link href={item.href} className="block w-full">
        <Button
          size="lg"
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 py-6 relative overflow-hidden",
            isActive && "text-primary font-bold"
          )}
        >
          {isActive && (
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
          )}

          <div
            className={cn(
              "rounded-md p-1.5 ring-1 ring-border",
              item.iconBg,
              item.iconColor
            )}
          >
            <item.icon size={18} />
          </div>
          <span className="text-[16px]">{item.label}</span>
        </Button>
      </Link>
    </div>
  );
};
