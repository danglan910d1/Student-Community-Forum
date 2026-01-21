"use client";

import { Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const HeroSection = () => {
  const isMobile = useIsMobile();

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background">
      {/* 1. Họa tiết Grid ẩn */}
      <div className="absolute inset-0 [background-image:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* 2. Các vòng tròn trang trí - Cố định tuyệt đối so với Section để không bị đẩy khi text thay đổi */}
      <div className="absolute -top-12 -right-12 w-40 h-40 border-[10px] border-primary/5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 border-[15px] border-primary/5 rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Badge tinh chỉnh lại tỉ lệ */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-primary/20 shadow-sm text-primary text-[10px] md:text-[11px] font-bold mb-8 tracking-[0.2em] uppercase">
          <Star size={12} fill="currentColor" className="animate-pulse" />
          The Future of Student Connection
        </div>

        {/* Tiêu đề đã được thu nhỏ lại */}
        <h1
          className={cn(
            "font-black text-title mb-8 tracking-tighter leading-[1.1] uppercase font-header drop-shadow-sm",
            isMobile ? "text-5xl" : "text-6xl lg:text-6xl",
          )}
        >
          STUDENT <br className="md:hidden" />
          <span className="text-primary italic relative inline-block">
            FORUM
            <span className="absolute bottom-1.5 left-0 w-full h-1 bg-primary/10 -z-10" />
          </span>
        </h1>

        {/* Paragraph text */}
        <p
          className={cn(
            "text-muted-foreground font-medium leading-relaxed max-w-xl mx-auto border-t border-border pt-8",
            isMobile ? "text-sm px-4" : "text-lg",
          )}
        >
          Chúng tôi kiến tạo một{" "}
          <span className="text-title font-bold bg-primary/5 px-2 py-1 rounded-lg">
            hệ sinh thái tri thức
          </span>{" "}
          nơi mọi sinh viên có thể tự do kết nối và phát triển bản thân.
        </p>
      </div>
    </section>
  );
};
