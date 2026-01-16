// modules/post/containers/UpdatePostContainer.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTopicStore } from "@/stores/useTopicStore";
import { useUpdatePost } from "@/modules/post/hooks/useUpdatePost";
import { useTagsData } from "@/modules/tag/hooks/useTagsData";
import { usePostDetail } from "@/modules/post/hooks/usePostDetail";
import { UpdatePostInput, updatePostSchema } from "../schemas/postSchema";
import { transformPostData } from "../utils/postTransform";
import { CardLayout } from "@/components/layout/CardLayout";
import { Separator } from "@/components/ui/separator";

import { PostFormHeader } from "../components/PostForm/PostFormHeader";
import { PostFormContent } from "../components/PostForm/PostFormContent";
import { PostFormActions } from "../components/PostForm/PostFormAction";

export function UpdatePostContainer() {
  const params = useParams();
  const postId = params.id as string;
  const isDataInitialized = useRef(false);

  const { topics } = useTopicStore();
  const { mutate: updatePost, isPending } = useUpdatePost(postId);
  const { data: post, isLoading: isLoadingPost } = usePostDetail(postId);

  const {
    getTagsByTopicId,
    systemTags,
    isLoading: isLoadingTags,
  } = useTagsData({ adminView: false });

  const methods = useForm<UpdatePostInput>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      title: "",
      content: "",
      topicId: "",
      tags: [],
      is_resolved: false,
    },
    mode: "onChange",
  });

  const selectedTopicId = methods.watch("topicId");
  const currentTags = methods.watch("tags");

  const topicTags = useMemo(
    () => getTagsByTopicId(selectedTopicId),
    [selectedTopicId, getTagsByTopicId]
  );

  // LOG 1: Theo dõi trạng thái Tags trong Form mỗi khi thay đổi
  useEffect(() => {
    console.log(">>> [FORM TAGS CURRENT]:", currentTags);
  }, [currentTags]);

  useEffect(() => {
    if (post && topics.length > 0 && !isDataInitialized.current) {
      console.log(">>> [FETCHED POST DATA]:", post);

      const normalizedTopicId = post.topic?.topicId
        ? String(post.topic.topicId)
        : "";

      // Khởi tạo mảng tags ban đầu
      const initialTags = [
        ...(post.tags || []),
        ...(post.pending_tags || []),
      ].map((t) => ({
        tagId: String(t.tagId || ""),
        name: t.name,
        slug: t.slug,
      }));

      // LOG 2: Kiểm tra xem lúc reset dữ liệu có bị trùng sẵn không
      console.log(">>> [CLEANED INITIAL TAGS]:", initialTags);

      const dataToReset: UpdatePostInput = {
        title: post.title || "",
        content: post.content || "",
        topicId: normalizedTopicId,
        is_resolved: post.is_resolved || false,
        tags: initialTags,
      };

      methods.reset(dataToReset);
      isDataInitialized.current = true;
    }
  }, [post, topics, methods]);

  const handleFormSubmit = (data: UpdatePostInput) => {
    // LOG 3: Kiểm tra payload cuối cùng trước khi gửi lên Server
    console.log(">>> [SUBMIT DATA RAW]:", data);
    const transformed = transformPostData(data);
    console.log(">>> [SUBMIT DATA TRANSFORMED]:", transformed);

    updatePost(transformed);
  };

  if (isLoadingPost || (isLoadingTags && !post)) {
    return (
      <div className="p-10 text-center animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">
          Đang chuẩn bị dữ liệu bài viết...
        </p>
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
