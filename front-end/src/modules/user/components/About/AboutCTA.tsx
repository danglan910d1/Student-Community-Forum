"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const AboutCTA = () => (
  // GIẢM PADDING SECTION: py-32 -> py-20
  <section className="py-20 px-6 text-center relative overflow-hidden">
    {/* Ambient Light: Làm gọn lại để tập trung vào trung tâm */}
    <div className="absolute inset-x-0 bottom-0 h-[300px] bg-primary/5 blur-[100px] rounded-full translate-y-1/2 pointer-events-none" />

    <div className="max-w-4xl mx-auto relative z-10 group">
      {/* Container nội dung với padding được ép chặt */}
      <div className="relative bg-white/50 backdrop-blur-sm border border-border/60 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-sm transition-all duration-500 hover:shadow-md">
        {/* GIỮ NGUYÊN CỠ CHỮ: text-3xl / text-5xl */}
        <h3 className="text-3xl md:text-5xl font-bold text-title mb-4 tracking-tight font-header italic leading-tight">
          Sẵn sàng trải nghiệm <br />
          <span className="text-primary not-italic">không gian số mới?</span>
        </h3>

        {/* GIỮ NGUYÊN CỠ CHỮ: text-lg */}
        <p className="text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed text-lg font-light">
          Gia nhập cộng đồng sinh viên ngay hôm nay để không bỏ lỡ những tri
          thức, công nghệ và cơ hội kết nối giá trị trong hệ sinh thái của chúng
          tôi.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20">
          <Button
            asChild
            size="lg"
            className="h-14 px-10 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 group/btn primary-gradient"
          >
            <Link href="/">
              Khám phá ngay
              <ArrowRight
                size={18}
                className="ml-2 group-hover/btn:translate-x-1 transition-transform"
              />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-14 px-10 rounded-2xl font-semibold border-border bg-white hover:bg-accent text-base transition-all"
          >
            <FileText size={18} className="mr-2 opacity-70" />
            Tài liệu hướng dẫn
          </Button>
        </div>

        {/* Thanh Border đáy chạy khi hover vào cả vùng CTA */}
        <div className="absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-1000 bg-gradient-to-r from-primary via-purple-500 to-primary z-30" />
      </div>
    </div>
  </section>
);
