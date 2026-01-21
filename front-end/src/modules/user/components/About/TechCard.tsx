"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TechCardProps {
  title: string;
  Icon: LucideIcon;
  items: string[];
  color: string;
}

export const TechCard = ({ title, Icon, items, color }: TechCardProps) => {
  const isMobile = useIsMobile();

  const colorMap: Record<string, string> = {
    "text-blue-500": "bg-blue-500",
    "text-purple-500": "bg-purple-500",
    "text-emerald-500": "bg-emerald-500",
  };

  const bgColor = colorMap[color] || "bg-primary";

  return (
    <Card className="relative group h-full border border-border/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden rounded-[2rem] hover:-translate-y-2">
      <div
        className={cn(
          "absolute -top-20 -right-20 w-40 h-40 opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-[80px] rounded-full",
          bgColor,
        )}
      />

      {/* GIẢM PADDING: pt-10 -> pt-6, px-8 -> px-6 */}
      <CardHeader className="relative z-10 pb-2 pt-6 px-6">
        <div
          className={cn(
            "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] bg-white border border-border/50 group-hover:scale-110",
            color,
          )}
        >
          <Icon size={isMobile ? 24 : 30} strokeWidth={1.5} />
        </div>
        {/* GIỮ NGUYÊN SIZE CHỮ: text-xl / text-2xl */}
        <h4
          className={cn(
            "font-bold text-title tracking-tight font-header italic leading-tight uppercase",
            isMobile ? "text-xl" : "text-2xl",
          )}
        >
          {title}
        </h4>
      </CardHeader>

      {/* GIẢM PADDING: px-8 -> px-6, pb-10 -> pb-6 */}
      <CardContent className="relative z-10 px-6 pb-6">
        <ul className={isMobile ? "space-y-3" : "space-y-4"}>
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 group/item">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0 mt-2.5 transition-all duration-500 group-hover/item:scale-150",
                  bgColor,
                  color,
                )}
              />
              {/* GIỮ NGUYÊN SIZE CHỮ: text-sm / text-[15px] */}
              <span
                className={cn(
                  "text-muted-foreground font-medium group-hover/item:text-title transition-colors duration-300",
                  isMobile ? "text-sm" : "text-[15px]",
                )}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <div
        className={cn(
          "absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700",
          bgColor,
        )}
      />
    </Card>
  );
};
