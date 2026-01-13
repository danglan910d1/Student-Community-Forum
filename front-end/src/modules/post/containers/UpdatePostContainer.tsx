"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation"; // 1. Lấy params từ URL
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

export function UpdatePostContainer() {
  const params = useParams();
  const postId = params.id as string; // Giả sử folder của bạn là [id]

  const { topics } = useTopicStore();
  const { mutate: updatePost, isPending } = useUpdatePost(postId);
  const { data: post, isLoading: isLoadingPost } = usePostDetail(postId);
  console.log(post);
  const {
    getTagsByTopicId,
    systemTags,
    isLoading: isLoadingTags,
  } = useTagsData({
    adminView: false,
  });

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

  useEffect(() => {
    if (post && !isLoadingTags) {
      methods.reset({
        title: post.title,
        content: post.content,
        topicId: post.topic?.topicId || "",
        tags: post.tags || [],
      });
    }
  }, [post, isLoadingTags, methods]);

  console.log(post);

  const handleFormSubmit = (data: CreatePostInput) => {
    updatePost(transformPostData(data));
  };

  if (isLoadingPost || (isLoadingTags && !post)) {
    return (
      <div className="p-10 text-center animate-pulse">Đang tải dữ liệu...</div>
    );
  }

  return (
    <CardLayout className="p-0 border-none shadow-sm">
      <div className="max-w-6xl p-5 space-y-8 animate-in fade-in duration-700">
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
