import { PostListContainer } from "@/modules/posts/containers/PostListContainer";
import { Suspense } from "react";
import ButtonShowcase from "@/components/shared/ButtonShowcase";

// Next.js Server Component
export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-extrabold mb-6 text-light">
        Trang Chủ Diễn Đàn
      </h1>

      {/* Container của bạn sử dụng 'use client' và hook fetching data 
        Nên nó được render trong môi trường client.
      */}
      <h1>Lan Test</h1>
      <ButtonShowcase />
    </main>
  );
}
