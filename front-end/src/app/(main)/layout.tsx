"use client";
import { Header } from "@/components/layout/Header";
import { MainContainer } from "@/components/layout/MainContainer";
import { Suspense } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="h-14 bg-header-footer" />}>
        <Header />
      </Suspense>

      {/* SỬA: Đảm bảo container này chiếm trọn không gian và không có padding thừa */}
      <div className="flex-1 flex flex-col relative w-full h-full">
        <MainContainer>{children}</MainContainer>
      </div>

      <footer className="border-t-4 border-blue-600 bg-slate-900 py-8 text-slate-400 z-30 relative shrink-0">
        <div className="mx-auto max-w-[1600px] px-4 grid grid-cols-4 gap-8">
          {/* Footer content */}
          <div>Footer Item</div>
          <div>Footer Item</div>
          <div>Footer Item</div>
          <div>Footer Item</div>
        </div>
      </footer>
    </div>
  );
}
