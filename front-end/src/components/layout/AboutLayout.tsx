// components/about/AboutLayout.tsx
import React from "react";

export const AboutLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // Sử dụng bg-base-background đồng nhất với body trong RootLayout
    <div className="relative w-full min-h-full bg-base-background overflow-hidden">
      {/* Hiệu ứng Glow nhẹ sử dụng biến --primary của hệ thống */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full h-full text-foreground">
        {children}
      </div>
    </div>
  );
};
