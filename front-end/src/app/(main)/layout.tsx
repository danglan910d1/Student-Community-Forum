"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { LeftSidebar } from "@/components/layout/LeftSiderBar";
import { MainContainer } from "@/components/layout/MainContainer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col">
      <Header />
      {/* pt-4 để tạo khoảng cách với header tương đương p-4 trong blueprint */}
      <div className="flex-1 flex flex-col">
        <MainContainer key={pathname}>{children}</MainContainer>
      </div>
      <footer className="mt-auto border-t-4 border-blue-600 bg-slate-900 py-8 text-slate-400">
        <div className="mx-auto max-w-[1600px] px-4 grid grid-cols-4 gap-8">
          {/* Render footer columns tương tự blueprint */}
        </div>
      </footer>
    </div>
  );
}
