// modules/post/containers/CreatePostContainer.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTopicStore } from "@/stores/useTopicStore";
import { useCreatePost } from "@/modules/post/hooks/useCreatePost";
import { useTags } from "@/modules/tag/hooks/useTag";

import MultiAutocomplete from "@/components/shared/MultiAutoComplete";
import MDEditor from "@uiw/react-md-editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TopicSelector } from "@/modules/topic/components/TopicSelector";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

import { createPostSchema, CreatePostInput } from "../schemas/postSchema";
import { transformPostData } from "../utils/postTransform";
import { CardLayout } from "@/components/layout/CardLayout";
import { Separator } from "@/components/ui/separator";
import { Loader2, SendHorizontal } from "lucide-react";

export function CreatePostContainer() {
  const { topics } = useTopicStore();
  const { mutate: createPost, isPending } = useCreatePost();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: "", content: "", topicId: "", tags: [] },
  });

  const selectedTopicId = watch("topicId");
  const { topicTags, systemTags } = useTags(selectedTopicId);

  const handleFormSubmit = (data: CreatePostInput) => {
    createPost(transformPostData(data));
  };

  return (
    <CardLayout className="p-0 border-none shadow-sm">
      <div className="max-w-6xl p-5 space-y-8 animate-in fade-in duration-700">
        <PostFormHeader />
        <Separator />

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-8 px-5"
        >
          {/* Topic Section */}
          <TopicSelector
            control={control}
            name="topicId"
            topics={topics}
            onTopicChange={() => setValue("tags", [])}
          />

          {/* Title Section */}
          <Field>
            <FieldLabel htmlFor="title" className="font-bold text-md">
              Tiêu đề bài viết
            </FieldLabel>
            <Input
              id="title"
              {...register("title")}
              placeholder="Mô tả vấn đề của bạn..."
              className={`border h-11 rounded-sm ${errors.title ? "border-red-500" : ""}`}
            />
            {errors.title && <FieldError>{errors.title.message}</FieldError>}
          </Field>

          {/* Editor Section */}
          <Field>
            <FieldLabel className="font-bold text-md">
              Nội dung chi tiết
            </FieldLabel>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <div
                  className={`border rounded-sm overflow-hidden ${errors.content ? "border-red-500" : ""}`}
                >
                  <MDEditor {...field} height={400} preview="edit" />
                </div>
              )}
            />
            {errors.content && (
              <FieldError>{errors.content.message}</FieldError>
            )}
          </Field>

          {/* Tags Section */}
          <MultiAutocomplete
            name="tags"
            control={control}
            disabled={!selectedTopicId}
            topicTags={topicTags}
            systemTags={systemTags}
            max={5}
          />

          <FormActions isPending={isPending} />
        </form>
      </div>
    </CardLayout>
  );
}

function PostFormHeader() {
  return (
    <header className="mb-8 space-y-2">
      <h1 className="text-title text-2xl font-bold tracking-tight uppercase">
        Đặt câu hỏi
      </h1>
      <p className="text-muted-foreground text-sm">
        Đảm bảo tiêu đề rõ ràng để nhận được phản hồi nhanh nhất.
      </p>
    </header>
  );
}

function FormActions({ isPending }: { isPending: boolean }) {
  return (
    <div className="flex justify-end items-center gap-4 pt-6 border-t">
      <Button
        variant="ghost"
        type="button"
        onClick={() => window.history.back()}
      >
        Hủy bỏ
      </Button>
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang xử lý
          </>
        ) : (
          <>
            <SendHorizontal className="mr-2 h-4 w-4" />
            Đăng bài viết
          </>
        )}
      </Button>
    </div>
  );
}
