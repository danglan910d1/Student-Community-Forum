"use client";

import { TEAM_MEMBERS } from "@/constants/aboutUs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const FoundersSection = () => {
  const isMobile = useIsMobile();

  return (
    <section className="py-20 px-6 relative overflow-hidden bg-background">
      {/* Ambient Light nền */}
      <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-3 opacity-80">
            Our Visionaries
          </h2>
          <h3
            className={cn(
              "font-bold text-title tracking-tight font-header italic leading-tight",
              isMobile ? "text-3xl" : "text-5xl", // Giữ nguyên chữ to
            )}
          >
            Đội ngũ phát triển.
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="group relative bg-white border border-border/80 rounded-[2rem] shadow-sm transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col"
            >
              {/* Nội dung Card: Padding nhỏ lại p-6/p-8 */}
              <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                <div className="flex items-center gap-5 mb-6">
                  {/* Avatar: Khôi phục đầy đủ shadow và gradient */}
                  <div
                    className={cn(
                      "rounded-2xl flex items-center justify-center text-white font-black shadow-lg bg-gradient-to-br transition-all duration-500 group-hover:scale-110",
                      member.gradient,
                      isMobile ? "w-14 h-14 text-xl" : "w-16 h-16 text-2xl",
                    )}
                  >
                    {member.avatar}
                  </div>
                  <div>
                    <h4
                      className={cn(
                        "font-bold text-title font-header",
                        isMobile ? "text-xl" : "text-2xl", // Giữ nguyên chữ to
                      )}
                    >
                      {member.name}
                    </h4>
                    <p className="text-primary text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] mt-1">
                      {member.role}
                    </p>
                  </div>
                </div>

                <p
                  className={cn(
                    "text-muted-foreground leading-relaxed flex-grow mb-6",
                    isMobile ? "text-sm" : "text-base font-light", // Giữ nguyên chữ to
                  )}
                >
                  {member.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {member.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted/50 border border-border/50 rounded-full text-[10px] text-muted-foreground uppercase font-semibold tracking-wider transition-colors group-hover:bg-primary/5 group-hover:text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Thanh Border dưới cùng: Sửa lỗi hiển thị màu */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 z-20 bg-gradient-to-r",
                  member.gradient,
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
