"use client";

import { CardLayout } from "@/components/layout/CardLayout";
import { Separator } from "@/components/ui/separator";
import { PostFormHeader } from "./PostFormHeader";

interface PostFormLayoutProps {
  title: string;
  description: string;
  isLoading?: boolean;
  children: React.ReactNode;
  minHeight?: string;
}

export function PostFormLayout({
  title,
  description,
  isLoading,
  children,
  minHeight = "600px",
}: PostFormLayoutProps) {
  return (
    <CardLayout className="p-0 border-none shadow-sm bg-transparent">
      <div
        className="max-w-6xl p-5 space-y-8 relative transition-all duration-500"
        style={{ minHeight }}
      >
        {/* 1. Header luôn hiển thị */}
        <PostFormHeader title={title} description={description} />
        <Separator />

        {/* 2. Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-2xl">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
              Đang chuẩn bị dữ liệu...
            </p>
          </div>
        )}

        {/* 3. Nội dung chính */}
        <div
          className={
            isLoading
              ? "opacity-20 pointer-events-none"
              : "animate-in fade-in duration-700"
          }
        >
          {children}
        </div>
      </div>
    </CardLayout>
  );
}
