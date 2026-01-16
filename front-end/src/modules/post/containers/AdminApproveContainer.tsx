"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { usePostDetail } from "@/modules/post/hooks/usePostDetail";
import { useAdminApprovePost } from "@/modules/post/hooks/useAdminApprovePost";

import { CardLayout } from "@/components/layout/CardLayout";
import { Separator } from "@/components/ui/separator";
import { UserIdentity } from "@/components/shared/UserIdentity";
import { PostFormHeader } from "../components/PostForm/PostFormHeader";
import { PostDetailSection } from "../components/PostDetail/PostDetailSection";
import { AdminReviewSection } from "../components/Admin/AdminReviewSection";

import { CreatePostInput } from "../schemas/postSchema";
import { IPendingTagAction, IPost, PostStatusAction } from "../types";
import { adminApproveSchema } from "../schemas/adminApproveSchema";
import { toast } from "sonner";

export function AdminApproveContainer() {
  const params = useParams();
  const postId = params.id as string;

  // --- 1. DATA FETCHING ---
  const { data: post, isLoading: isLoadingPost } = usePostDetail(
    postId,
    true
  ) as { data: IPost | undefined; isLoading: boolean };

  const { mutate: approvePost, isPending: isSubmitting } =
    useAdminApprovePost(postId);

  // --- 2. FORM SETUP ---
  const methods = useForm<CreatePostInput>({
    defaultValues: { title: "", content: "", topicId: "", tags: [] },
  });

  // --- 3. ADMIN STATE ---
  const [newPostStatus, setNewPostStatus] =
    useState<PostStatusAction>("approved");
  const [pendingTagActions, setPendingTagActions] = useState<
    IPendingTagAction[]
  >([]);

  /**
   * Thay vì dùng useEffect để setKeepTagIds, ta dùng state và đồng bộ nó
   * dựa trên dữ liệu 'post' ngay khi render.
   */
  const [keepTagIds, setKeepTagIds] = useState<string[]>([]);
  const [prevPostId, setPrevPostId] = useState<string | null>(null);

  // Đồng bộ hóa thủ công thay vì useEffect để tránh "cascading renders"
  // Khi post thay đổi từ null sang có dữ liệu, ta reset các state liên quan
  if (post && post.postId !== prevPostId) {
    setPrevPostId(post.postId);

    // Reset local states
    const initialTagIds = post.tags?.map((t) => t.tagId) || [];
    setKeepTagIds(initialTagIds);

    // Reset form data
    methods.reset({
      title: post.title,
      content: post.content,
      topicId: post.topic?.topicId ? String(post.topic.topicId) : "",
      tags: post.tags,
    });
  }

  // --- 4. LOGIC HANDLERS ---
  const handleFinalSubmit = () => {
    if (!post) return;
    const payload = {
      newPostStatus,
      keepTagIds,
      pendingTagActions,
      // reason: "" // Thêm nếu bạn có UI nhập lý do
    };
    const pendingCount = post.pending_tags?.length || 0;
    if (pendingCount !== pendingTagActions.length) {
      alert("Vui lòng xử lý tất cả các thẻ đề xuất mới trước khi xác nhận!");
      return;
    }
    const validation = adminApproveSchema.safeParse(payload);

    if (!validation.success) {
      // Lấy lỗi đầu tiên từ Zod và hiển thị
      const firstError = validation.error.errors[0]?.message;
      toast.error(firstError || "Dữ liệu kiểm duyệt không hợp lệ");
      return;
    }
    approvePost(validation.data);
  };

  if (isLoadingPost) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Đang tải dữ liệu bài viết...
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <CardLayout className="max-w-6xl mx-auto mt-10 p-20 text-center border-none shadow-none">
        <p className="text-muted-foreground font-bold uppercase">
          Không tìm thấy bài viết.
        </p>
      </CardLayout>
    );
  }

  return (
    <CardLayout className="max-w-6xl mx-auto border-none p-0 shadow-none bg-transparent">
      <div className="space-y-8 p-5">
        <PostFormHeader
          title="Kiểm duyệt nội dung"
          description="Xem xét nội dung người dùng và đưa ra quyết định duyệt bài viết & thẻ tag."
        />
        <Separator />

        <section className="overflow-hidden rounded-2xl border border-border bg-muted/20 pb-8">
          <header className="bg-muted px-5 py-3 border-b border-border flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-black uppercase text-muted-foreground">
                  Chủ đề:
                </span>
                <Link
                  href={`/posts?topic=${post.topic?.slug}`}
                  target="_blank"
                  className="text-[14px] text-foreground font-bold hover:underline"
                >
                  {post.topic?.name || "Chưa phân loại"}
                </Link>
              </div>
              <p className="text-[12px] uppercase font-bold opacity-60">
                {format(new Date(post.createdAt), "HH:mm, dd/MM/yyyy", {
                  locale: vi,
                })}
              </p>
            </div>
            <UserIdentity user={post.user} size="md" />
          </header>

          <div className="pointer-events-none select-none opacity-90 pt-4">
            <PostDetailSection post={post} isAdminReview={true} />
          </div>
        </section>

        <Separator className="opacity-50" />

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <AdminReviewSection
            post={post}
            keepTagIds={keepTagIds}
            setKeepTagIds={setKeepTagIds}
            pendingTagActions={pendingTagActions}
            setPendingTagActions={setPendingTagActions}
            newPostStatus={newPostStatus}
            setNewPostStatus={setNewPostStatus}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </CardLayout>
  );
}
