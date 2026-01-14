// modules/post/containers/AdminApproveContainer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { useTopicStore } from "@/stores/useTopicStore";
import { usePostDetail } from "@/modules/post/hooks/usePostDetail";
import { useAdminApprovePost } from "@/modules/post/hooks/useAdminApprovePost";
import { useTagsData } from "@/modules/tag/hooks/useTagsData";

import { CardLayout } from "@/components/layout/CardLayout";
import { Separator } from "@/components/ui/separator";
import { PostFormHeader } from "../components/PostForm/PostFormHeader";
import { PostFormContent } from "../components/PostForm/PostFormContent";

import { CreatePostInput } from "../schemas/postSchema";
import { IPendingTagAction } from "../types";
import { AdminReviewSection } from "../components/Admin/AdminReviewSection";
import { IPost } from "../types"; // Đảm bảo bạn có Interface IPost

export function AdminApproveContainer() {
  const params = useParams();
  const postId = params.id as string;
  const isInitialized = useRef(false);

  // --- 1. DATA FETCHING ---
  const { topics } = useTopicStore();

  // Ép kiểu data về IPost để tránh lỗi "any" hoặc "undefined"
  const { data: post, isLoading: isLoadingPost } = usePostDetail(
    postId,
    true
  ) as {
    data: IPost | undefined;
    isLoading: boolean;
  };

  const { mutate: approvePost, isPending: isSubmitting } =
    useAdminApprovePost(postId);

  // Mặc dù disabled nhưng vẫn gọi hook để tránh vi phạm Rule of Hooks
  const { systemTags } = useTagsData({ adminView: true });

  // --- 2. FORM SETUP ---
  const methods = useForm<CreatePostInput>({
    defaultValues: { title: "", content: "", topicId: "", tags: [] },
  });

  // --- 3. ADMIN SPECIAL STATE ---
  const [newPostStatus, setNewPostStatus] = useState<"approved" | "rejected">(
    "approved"
  );
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
        tags: post.tags, // Sync để đảm bảo logic bên trong PostFormContent không lỗi
      });

      // Khởi tạo danh sách ID thẻ hiện có
      if (post.tags) {
        setKeepTagIds(post.tags.map((t) => t.tagId));
      }

      isInitialized.current = true;
    }
  }, [post, methods]);

  // --- 4. LOGIC HANDLERS ---
  const handleFinalSubmit = () => {
    if (!post) return;

    // Validate: Mọi tag pending đều phải được Admin chọn hành động
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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Đang tải dữ liệu bài viết...
          </p>
        </div>
      </div>
    );
  }

  if (!post)
    return <div className="p-20 text-center">Không tìm thấy bài viết.</div>;

  return (
    <CardLayout className="max-w-6xl mx-auto border-none p-0 shadow-sm">
      <div className="space-y-8 p-5">
        <PostFormHeader
          title="Kiểm duyệt nội dung"
          description="Xem xét nội dung người dùng cung cấp và đưa ra quyết định lưu trữ thẻ tag."
        />

        <Separator />

        {/* PHẦN A: NỘI DUNG (READ ONLY) */}
        <FormProvider {...methods}>
          <section className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/30 pb-8">
            <div className="bg-slate-200/50 p-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Dữ liệu gốc từ người viết
            </div>
            <div className="pointer-events-none select-none opacity-90">
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

        <div className="py-2">
          <Separator className="bg-slate-100" />
        </div>

        {/* PHẦN B: KHU VỰC KIỂM DUYỆT */}
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
    </CardLayout>
  );
}
