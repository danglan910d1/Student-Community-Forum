// src/app/page.tsx

import { PostListContainer } from '@/modules/posts/containers/PostListContainer'; 
import { Suspense } from 'react';
import Button from '@/components/ui/Button';

// Next.js Server Component
export default function HomePage() {
  return (
    <main className="p-8 bg-red-500 ">
      <h1 className="text-3xl font-extrabold mb-6 font-body">Trang Chủ Diễn Đàn</h1>
      
      {/* Container của bạn sử dụng 'use client' và hook fetching data 
        Nên nó được render trong môi trường client.
      */}
      <Suspense fallback={<div>Đang tải nội dung...</div>}>
        <PostListContainer />
        <Button>Test</Button>
      </Suspense>

      <div className="bg-red-500 p-40">
        Test màu tailwind
      </div>

      <div className="bg-red-500 text-white p-10">
  Hello Tailwind
</div>
<button
  className="px-5 py-2 bg-fe-nav text-fe-text-light rounded-smooth shadow-card 
         hover:bg-fe-brand transition-normal font-body"
>
  New Post
</button>
<div className="p-10 bg-blue-500 text-white text-3xl">
  Tailwind OK!
</div>


    </main>
  );
}