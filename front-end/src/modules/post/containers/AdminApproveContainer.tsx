"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useTopicStore } from "@/stores/useTopicStore";
import { usePostDetail } from "@/modules/post/hooks/usePostDetail";
import { useAdminApprovePost } from "@/modules/post/hooks/useAdminApprovePost";

import { CardLayout } from "@/components/layout/CardLayout";
import { Separator } from "@/components/ui/separator";
import { PostFormHeader } from "../components/PostForm/PostFormHeader";
import { PostFormContent } from "../components/PostForm/PostFormContent";

import { CreatePostInput } from "../schemas/postSchema";
import { IPendingTagAction, IPost, PostStatusAction } from "../types";
import { AdminReviewSection } from "../components/Admin/AdminReviewSection";
import { UserIdentity } from "@/components/shared/UserIdentity";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function AdminApproveContainer() {
  const params = useParams();
  const postId = params.id as string;
  const isInitialized = useRef(false);

  // --- 1. DATA FETCHING ---
  const { topics } = useTopicStore();

  const { data: post, isLoading: isLoadingPost } = usePostDetail(
    postId,
    true
  ) as {
    data: IPost | undefined;
    isLoading: boolean;
  };

  const { mutate: approvePost, isPending: isSubmitting } =
    useAdminApprovePost(postId);

  // --- 2. FORM SETUP ---
  const methods = useForm<CreatePostInput>({
    defaultValues: { title: "", content: "", topicId: "", tags: [] },
  });

  // --- 3. ADMIN SPECIAL STATE ---
  const [newPostStatus, setNewPostStatus] =
    useState<PostStatusAction>("approved");
  const [keepTagIds, setKeepTagIds] = useState<string[]>([]);
  const [pendingTagActions, setPendingTagActions] = useState<
    IPendingTagAction[]
  >([]);

  // Sync dữ liệu vào Form & State kiểm duyệt
  useEffect(() => {
    if (post && !isInitialized.current) {
      methods.reset({
        title: post.title,
        content: post.content,
        topicId: post.topic?.topicId ? String(post.topic.topicId) : "",
        tags: post.tags,
      });

      if (post.tags) {
        setKeepTagIds(post.tags.map((t) => t.tagId));
      }

      isInitialized.current = true;
    }
  }, [post, methods]);

  // --- 4. LOGIC HANDLERS ---
  const handleFinalSubmit = () => {
    if (!post) return;

    const pendingCount = post.pending_tags?.length || 0;
    if (pendingCount !== pendingTagActions.length) {
      alert("Vui lòng xử lý tất cả các thẻ đề xuất mới trước khi xác nhận!");
      return;
    }

    approvePost({
      newPostStatus,
      keepTagIds,
      pendingTagActions,
    });
  };

  if (isLoadingPost) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Đang tải dữ liệu bài viết...
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <CardLayout className="max-w-6xl mx-auto mt-10 p-20 text-center border-none shadow-none">
        <p className="text-muted-foreground font-bold uppercase tracking-widest">
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
          description="Xem xét nội dung người dùng và đưa ra quyết định lưu trữ thẻ tag."
        />

        <Separator />

        {/* PHẦN A: NỘI DUNG (READ ONLY) - SỬ DỤNG SEMANTIC COLORS */}
        <FormProvider {...methods}>
          <section className="overflow-hidden rounded-2xl border border-border bg-muted/20 pb-8 transition-colors">
            <header className="bg-muted px-5 py-3 border-b border-border flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Dữ liệu gốc từ người viết
                </span>
                <p className="text-[9px] uppercase font-bold opacity-60">
                  {format(new Date(post.createdAt), "HH:mm, dd/MM/yyyy", {
                    locale: vi,
                  })}
                </p>
              </div>

              {/* GỌI COMPONENT IDENTITY MỚI */}
              <UserIdentity
                user={post.user}
                size="md" // Avatar to hơn xíu cho Header duyệt bài
              />
            </header>
            <div className="pointer-events-none select-none opacity-80 grayscale-[0.1] pt-4">
              <PostFormContent
                disabled={true}
                topics={topics}
                selectedTopicId={methods.watch("topicId")}
                topicTags={[]}
                systemTags={[]}
              />
            </div>
          </section>
        </FormProvider>

        <Separator className="opacity-50" />

        {/* PHẦN B: KHU VỰC KIỂM DUYỆT - ĐỒNG BỘ VỚI RADIUS-2XL */}
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
