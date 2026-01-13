"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TagSearchHeaderProps {
  onSearch: (value: string) => void;
}

export function TagSearchHeader({ onSearch }: TagSearchHeaderProps) {
  return (
    <header className="mb-12">
      <div className="max-w-2xl">
        <h1 className="text-title text-2xl tracking-tight mb-3 uppercase">
          Chủ đề
        </h1>
        <p className="text-md text-muted-foreground text-sm leading-relaxed mb-6">
          Các thẻ giúp phân loại nội dung và kết nối bạn với những chủ đề quan
          tâm
        </p>

        <div className="relative group max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <Input
            type="text"
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm nhanh thẻ (ví dụ: React, Java...)"
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
      </div>
    </header>
  );
}
