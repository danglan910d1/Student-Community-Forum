"use client";

import { IPost } from "../../types";
import { PostDetailHeader } from "./PostDetailHeader";
import { PostDetailBody } from "./PostDetailBody";
import { PostDetailAside } from "./PostDetailAside";
import { Separator } from "@/components/ui/separator";
import { PostCommentsContainer } from "../../containers/CommentContainer";
import { CardLayout } from "@/components/layout/CardLayout";

interface PostDetailSectionProps {
  post: IPost;
  isAdminReview?: boolean; // Thêm prop này
}

export function PostDetailSection({
  post,
  isAdminReview = false,
}: PostDetailSectionProps) {
  return (
    <CardLayout className="p-0 border-none shadow-sm">
      <div className="max-w-6xl mx-auto p-5 space-y-8 animate-in fade-in duration-700">
        {/* Truyền isAdminReview vào Header để ẩn Like/Menu */}
        <PostDetailHeader post={post} isAdminReview={isAdminReview} />

        <div className="grid grid-cols-1 px-5 pb-2 lg:grid-cols-12 gap-8">
          {/* CỘT CHÍNH: Nếu đang duyệt thì chiếm hết 12 cột hoặc giữ 9 tùy UI bạn muốn */}
          <div className={isAdminReview ? "lg:col-span-12" : "lg:col-span-9"}>
            <article className="bg-card rounded-xl border p-1 md:p-0 border-none shadow-none">
              <PostDetailBody post={post} />
            </article>

            {/* Chỉ hiện bình luận khi KHÔNG phải đang duyệt bài */}
            {!isAdminReview && (
              <>
                <Separator className="my-10" />
                <section id="comments" className="scroll-mt-20">
                  <PostCommentsContainer postId={post.postId} />
                </section>
              </>
            )}
          </div>

          {/* CỘT PHỤ: Ẩn hoàn toàn khi đang duyệt bài */}
          {!isAdminReview && (
            <aside className="lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                <PostDetailAside post={post} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </CardLayout>
  );
}
