"use client";

import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTopicStore } from "@/stores/useTopicStore";
import { useCreatePost } from "@/modules/post/hooks/useCreatePost";
import { useTagsData } from "@/modules/tag/hooks/useTagsData";
import { createPostSchema, CreatePostInput } from "../schemas/postSchema";
import { transformPostData } from "../utils/postTransform";
import { CardLayout } from "@/components/layout/CardLayout";
import { Separator } from "@/components/ui/separator";

import { PostFormHeader } from "../components/PostForm/PostFormHeader";
import { PostFormContent } from "../components/PostForm/PostFormContent";
import { PostFormActions } from "../components/PostForm/PostFormAction";

export function CreatePostContainer() {
  const { topics } = useTopicStore();
  const { mutate: createPost, isPending } = useCreatePost();

  const { getTagsByTopicId, systemTags, isLoading } = useTagsData({
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

  // Đồng nhất logic lấy tags theo Topic
  const topicTags = useMemo(() => {
    return getTagsByTopicId(selectedTopicId);
  }, [selectedTopicId, getTagsByTopicId]);

  const handleFormSubmit = (data: CreatePostInput) => {
    // LOG để kiểm tra dữ liệu trước khi transform
    console.log(">>> [CREATE POST RAW DATA]:", data);

    // transformPostData sẽ xử lý mảng tags thành hỗn hợp ID/Name cho BE
    createPost(transformPostData(data));
  };

  return (
    <CardLayout className="p-0 border-none shadow-sm">
      <div className="max-w-6xl p-5 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <PostFormHeader
          title="Tạo bài viết mới"
          description="Chia sẻ kiến thức hoặc đặt câu hỏi để nhận được sự hỗ trợ từ cộng đồng."
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
              onCancel={() => {
                if (confirm("Bạn có chắc muốn huỷ bỏ nội dung đang nhập?")) {
                  methods.reset();
                }
              }}
              submitText="Đăng bài ngay"
              cancelText="Làm mới"
            />
          </form>
        </FormProvider>
      </div>
    </CardLayout>
  );
}
