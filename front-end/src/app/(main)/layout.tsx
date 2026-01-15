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

      {/* Thêm relative và z-index thấp hơn footer nếu cần */}
      <div className="flex-1 flex flex-col relative z-0">
        <MainContainer>{children}</MainContainer>
      </div>

      <footer className="mt-auto border-t-4 border-blue-600 bg-slate-900 py-8 text-slate-400 z-30 relative">
        <div className="mx-auto max-w-[1600px] px-4 grid grid-cols-4 gap-8">
          {/* Footer content */}
        </div>
      </footer>
    </div>
  );
}
