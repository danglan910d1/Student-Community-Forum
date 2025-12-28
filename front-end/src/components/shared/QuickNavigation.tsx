"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { CardLayout } from "../layout/CardLayout";
import { QUICK_NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export const QuickNavigation = () => {
  const pathname = usePathname();

  return (
    <CardLayout className="shadow-md">
      {QUICK_NAV_ITEMS.map((item, index) => {
        // Kiểm tra xem href của item có khớp với pathname hiện tại không
        const isActive = pathname === item.href;

        return (
          <div key={item.label}>
            {/* Vẽ đường kẻ trước mỗi item, trừ item đầu tiên */}
            {index > 0 && <div className="border-t mx-2 my-1" />}

            <Link href={item.href} className="block w-full">
              <Button
                size={"lg"}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 hover:text-blue-700 py-3",
                  // Khi active, ta ép Button dùng style của trạng thái hover
                  isActive && "bg-accent text-accent-foreground text-blue-700"
                )}
              >
                <div
                  className={cn(
                    "rounded-md p-1.5",
                    item.iconBg,
                    item.iconColor,
                    // Nếu muốn icon cũng nổi bật hơn khi active
                    isActive && "ring-1 ring-blue-700/20"
                  )}
                >
                  <item.icon size={18} />
                </div>
                <span className="text-title text-[16px] font-bold">
                  {item.label}
                </span>
              </Button>
            </Link>
          </div>
        );
      })}
    </CardLayout>
  );
};
