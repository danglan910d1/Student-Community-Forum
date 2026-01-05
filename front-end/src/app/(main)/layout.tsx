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
    <div className="flex flex-col">
      {/* Bọc Header vì Header chứa Dropdown sử dụng searchParams */}
      <Suspense fallback={<div className="h-14 bg-header-footer" />}>
        <Header />
      </Suspense>
      {/* pt-4 để tạo khoảng cách với header tương đương p-4 trong blueprint */}
      <div className="flex-1 flex flex-col">
        <MainContainer>{children}</MainContainer>
      </div>
      <footer className="mt-auto border-t-4 border-blue-600 bg-slate-900 py-8 text-slate-400">
        <div className="mx-auto max-w-[1600px] px-4 grid grid-cols-4 gap-8">
          {/* Render footer columns tương tự blueprint */}
        </div>
      </footer>
    </div>
  );
}
