// modules/post/components/PostForm/PostFormContent.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { TopicSelector } from "@/modules/topic/components/TopicSelector";
import MultiAutocomplete from "@/components/shared/MultiAutoComplete";
import { ITag, Tag } from "@/modules/tag/types";
import { ITopic } from "@/modules/topic/types";
import { CreatePostInput } from "../../schemas/postSchema";

// Import các component tái sử dụng
import { PostFormTitle } from "./PostFormTitle";
import { PostFormEditor } from "./PostFormEditor";

interface PostFormContentProps {
  topics: ITopic[];
  topicTags: Tag[];
  systemTags: ITag[];
  selectedTopicId: string;
  disabled?: boolean;
}

export function PostFormContent({
  topics,
  topicTags,
  systemTags,
  selectedTopicId,
}: PostFormContentProps) {
  const {
    control,
    setValue,
    formState: { isDirty },
  } = useFormContext<CreatePostInput>();

  const handleTopicChange = () => {
    // CHỈ xóa tags nếu người dùng thực sự thao tác (form đã bẩn)
    // Hoặc kiểm tra nếu giá trị mới khác giá trị cũ
    if (isDirty) {
      setValue("tags", []);
    }
  };

  return (
    <div className="space-y-8 px-5">
      {/* 1. Chọn Topic */}
      <TopicSelector
        control={control}
        name="topicId"
        topics={topics}
        onTopicChange={handleTopicChange}
      />

      {/* 2. Tiêu đề - Truyền props để tái sử dụng */}
      <PostFormTitle<CreatePostInput>
        name="title"
        label="Tiêu đề bài viết"
        placeholder="Mô tả vấn đề của bạn..."
      />

      {/* 3. Nội dung Markdown - Truyền props để tái sử dụng */}
      <PostFormEditor name="content" label="Nội dung chi tiết" />

      {/* 4. Tags */}
      <MultiAutocomplete
        name="tags"
        control={control}
        disabled={!selectedTopicId}
        topicTags={topicTags}
        systemTags={systemTags}
        max={5}
      />
    </div>
  );
}
