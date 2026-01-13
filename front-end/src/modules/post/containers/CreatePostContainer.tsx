"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTopicStore } from "@/stores/useTopicStore";
import { useCreatePost } from "@/modules/post/hooks/useCreatePost";
import { useTagsData } from "@/modules/tag/hooks/useTagsData";
import { createPostSchema, CreatePostInput } from "../schemas/postSchema";
import { transformPostData } from "../utils/postTransform";
import { CardLayout } from "@/components/layout/CardLayout";
import { Separator } from "@/components/ui/separator";

// Import các component của bạn
import { PostFormHeader } from "../components/PostForm/PostFormHeader";
import { PostFormContent } from "../components/PostForm/PostFormContent";
import { PostFormActions } from "../components/PostForm/PostFormAction";
import { useMemo } from "react";

export function CreatePostContainer() {
  const { topics } = useTopicStore();
  const { mutate: createPost, isPending } = useCreatePost();

  const methods = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      topicId: "",
      tags: [],
    },
    // Chế độ validation khi người dùng tương tác
    mode: "onChange",
  });

  const selectedTopicId = methods.watch("topicId");

  const { getTagsByTopicId, systemTags } = useTagsData({
    adminView: false,
  });

  // 2. Lấy tags dựa trên topic đã chọn từ dữ liệu có sẵn trong cache
  const topicTags = useMemo(() => {
    return getTagsByTopicId(selectedTopicId);
  }, [selectedTopicId, getTagsByTopicId]);

  const handleFormSubmit = (data: CreatePostInput) => {
    createPost(transformPostData(data));
  };

  return (
    <CardLayout className="p-0 border-none shadow-sm">
      <div className="max-w-6xl p-5 space-y-8 animate-in fade-in duration-700">
        {/* 1. Header: Thêm nội dung phù hợp cho trang Create */}
        <PostFormHeader
          title="Tạo bài viết mới"
          description="Chia sẻ kiến thức hoặc đặt câu hỏi cho cộng đồng."
        />

        <Separator />

        {/* 2. FormProvider cung cấp context cho các component con */}
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

            {/* 3. Footer: Nút bấm Submit */}
            <PostFormActions
              isPending={isPending}
              onCancel={() => methods.reset()}
              submitText="Đăng bài"
              cancelText="Huỷ"
            />
          </form>
        </FormProvider>
      </div>
    </CardLayout>
  );
}
