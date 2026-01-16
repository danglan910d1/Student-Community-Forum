"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTopicStore } from "@/stores/useTopicStore";
import { useUpdatePost } from "@/modules/post/hooks/useUpdatePost";
import { useTagsData } from "@/modules/tag/hooks/useTagsData";
import { usePostDetail } from "@/modules/post/hooks/usePostDetail";
import { createPostSchema, CreatePostInput } from "../schemas/postSchema";
import { transformPostData } from "../utils/postTransform";
import { CardLayout } from "@/components/layout/CardLayout";
import { Separator } from "@/components/ui/separator";

import { PostFormHeader } from "../components/PostForm/PostFormHeader";
import { PostFormContent } from "../components/PostForm/PostFormContent";
import { PostFormActions } from "../components/PostForm/PostFormAction";
import ContentPageSkeleton from "@/components/loading/ContentPageSkeleton";

export function UpdatePostContainer() {
  const params = useParams();
  const postId = params.id as string;

  // Khóa để chỉ reset dữ liệu 1 lần duy nhất khi load thành công
  const isDataInitialized = useRef(false);

  const { topics } = useTopicStore();
  const { mutate: updatePost, isPending } = useUpdatePost(postId);

  // Lấy dữ liệu bài viết (Kiểu IPost chuẩn)
  const { data: post, isLoading: isLoadingPost } = usePostDetail(postId);
  console.log(post);

  const {
    getTagsByTopicId,
    systemTags,
    isLoading: isLoadingTags,
  } = useTagsData({ adminView: false });

  const methods = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      topicId: "",
      tags: [],
    },
    mode: "onChange",
  });

  const selectedTopicId = methods.watch("topicId");

  const topicTags = useMemo(() => {
    return getTagsByTopicId(selectedTopicId);
  }, [selectedTopicId, getTagsByTopicId]);

  const formValues = methods.watch();

  useEffect(() => {
    if (post && topics.length > 0 && !isDataInitialized.current) {
      // 1. Chuyển đổi ID về string để đồng bộ với Select value
      const normalizedTopicId = post.topic?.topicId
        ? String(post.topic.topicId)
        : "";

      const dataToReset = {
        title: post.title || "",
        content: post.content || "",
        topicId: normalizedTopicId,
        tags: [...(post.tags || []), ...(post.pending_tags || [])].map((t) => ({
          tagId: String(t.tagId),
          name: t.name,
          slug: t.slug,
        })),
      };

      // 2. Reset form với keepDefaultValues: false để ghi đè hoàn toàn
      methods.reset(dataToReset);

      isDataInitialized.current = true;
    }
  }, [post, topics, methods]);

  // Log này sẽ chạy mỗi khi Form thay đổi (do lệnh watch)
  console.log(">>> FORM STATE CURRENT:", formValues);

  const handleFormSubmit = (data: CreatePostInput) => {
    updatePost(transformPostData(data));
  };

  // UI Loading
  if (isLoadingPost || (isLoadingTags && !post)) {
    // return (
    //   <div className="p-10 text-center animate-pulse flex flex-col items-center gap-4">
    //     <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    //     <p className="text-muted-foreground font-medium">
    //       Đang chuẩn bị dữ liệu bài viết...
    //     </p>
    //   </div>
    // );
    return (
      <div>
        <ContentPageSkeleton />
      </div>
    );
  }

  return (
    <CardLayout className="p-0 border-none shadow-sm">
      <div className="max-w-6xl p-5 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <PostFormHeader
          title="Chỉnh sửa bài viết"
          description="Cập nhật lại nội dung bài viết để cộng đồng hỗ trợ tốt hơn."
        />

        <Separator />

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(handleFormSubmit)}
            className="space-y-8"
          >
            <PostFormContent
              topics={topics}
              topicTags={topicTags}
              systemTags={systemTags}
              selectedTopicId={selectedTopicId}
            />

            <PostFormActions
              isPending={isPending}
              onCancel={() => window.history.back()}
              submitText="Cập nhật ngay"
              cancelText="Huỷ bỏ"
            />
          </form>
        </FormProvider>
      </div>
    </CardLayout>
  );
}
