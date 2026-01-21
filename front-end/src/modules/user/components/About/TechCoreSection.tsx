"use client";

import React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TECH_STACK } from "@/constants/aboutUs";
import { TechCard } from "./TechCard";

export const TechCoreSection = () => {
  const plugin = React.useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  return (
    // GIẢM PADDING SECTION: py-32 -> py-20
    <section className="py-20 px-6 relative overflow-hidden bg-background">
      <div className="absolute top-10 left-0 w-full select-none pointer-events-none overflow-hidden opacity-[0.03]">
        <span className="text-[15vw] font-black uppercase tracking-tighter leading-none whitespace-nowrap">
          Engineering Architecture Tech Stack
        </span>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* GIẢM KHOẢNG CÁCH HEADER: mb-20 -> mb-12 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div className="space-y-3">
            <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] md:text-[11px] opacity-80">
              Engineering Architecture
            </h2>
            {/* GIỮ NGUYÊN SIZE CHỮ: text-3xl / text-5xl */}
            <h3 className="text-3xl md:text-5xl font-bold text-title tracking-tight font-header italic">
              Kiến trúc đa tầng{" "}
              <span className="text-primary not-italic">bền vững.</span>
            </h3>
          </div>

          {/* GIỮ NGUYÊN SIZE CHỮ: text-lg */}
          <p className="max-w-sm text-muted-foreground text-lg border-l-2 border-primary/30 pl-6 leading-relaxed font-light">
            Chúng tôi ưu tiên{" "}
            <span className="text-title font-medium">hiệu năng thực tế</span> và
            <span className="text-title font-medium"> khả năng bảo mật </span>
            dữ liệu lên hàng đầu.
          </p>
        </div>

        <div className="relative">
          <Carousel
            plugins={[plugin.current]}
            className="w-full cursor-grab active:cursor-grabbing"
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false,
            }}
          >
            {/* GIẢM PADDING CAROUSEL: py-12 -> py-8 */}
            <CarouselContent className="-ml-4 py-8">
              {[...TECH_STACK, ...TECH_STACK].map((tech, idx) => (
                <CarouselItem
                  key={idx}
                  className="pl-4 basis-full md:basis-1/2 lg:basis-1/3 overflow-visible"
                >
                  <div className="h-full p-1.5">
                    <TechCard
                      title={tech.title}
                      Icon={tech.icon}
                      items={tech.items}
                      color={tech.color}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="hidden md:block">
              <CarouselPrevious className="-left-12 h-12 w-12 border-primary/20 bg-white shadow-sm hover:bg-primary hover:text-white transition-all duration-300" />
              <CarouselNext className="-right-12 h-12 w-12 border-primary/20 bg-white shadow-sm hover:bg-primary hover:text-white transition-all duration-300" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};
