// src/app/page.tsx

import { PostListContainer } from '@/modules/posts/containers/PostListContainer'; 
import { Suspense } from 'react';

// Next.js Server Component
export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-extrabold mb-6">Trang Chủ Diễn Đàn</h1>
      
      {/* Container của bạn sử dụng 'use client' và hook fetching data 
        Nên nó được render trong môi trường client.
      */}
      <Suspense fallback={<div>Đang tải nội dung...</div>}>
        <PostListContainer />
      </Suspense>
      
    </main>
  );
}