// src/components/PostDetail/PostDetailSection.tsx
"use client";

import { IPost } from "../../types";
import { PostDetailHeader } from "./PostDetailHeader";
import { PostDetailBody } from "./PostDetailBody";
import { PostDetailAside } from "./PostDetailAside";
import { Separator } from "@/components/ui/separator";
import { PostCommentsContainer } from "../../containers/CommentContainer";

export function PostDetailSection({ post }: { post: IPost }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
      {/* KHUNG 1: Tiêu đề, Tags, Thông tin tác giả cơ bản */}
      <PostDetailHeader post={post} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT CHÍNH: Nội dung bài viết và Bình luận */}
        <div className="lg:col-span-9 space-y-10">
          {/* Nội dung bài viết */}
          <article className="bg-card rounded-xl border p-1 md:p-0 border-none shadow-none">
            <PostDetailBody post={post} />
          </article>

          <Separator className="bg-muted/60" />

          {/* Khu vực bình luận nằm trong cùng luồng với nội dung chính */}
          <section id="comments" className="scroll-mt-20">
            <PostCommentsContainer postId={post.postId} />
          </section>
        </div>

        {/* CỘT PHỤ: Sidebar (Thông tin bổ sung, Bài viết liên quan) */}
        <aside className="lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <PostDetailAside post={post} />
          </div>
        </aside>
      </div>
    </div>
  );
}
