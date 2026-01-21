"use client";

import { Control } from "react-hook-form";
import { ITopic } from "@/modules/topic/types";
import { GenericField } from "@/components/shared/GenericField";
import { StatusFormSelect } from "@/components/shared/StatusSelect";
import { TagInput } from "../../schemas/tagSchemas";
import { SimpleTopicSelect } from "@/modules/topic/components/TopicForm/SimpleTopicSelect";

interface TagFormContentProps {
  control: Control<TagInput>;
  topics: ITopic[];
  isLoading?: boolean;
}

export function TagFormContent({
  control,
  topics,
  isLoading,
}: TagFormContentProps) {
  return (
    <div className="grid gap-5 py-2">
      {/* Không truyền control vào GenericField vì nó dùng useFormContext */}
      <GenericField<TagInput>
        name="name"
        label="Tên thẻ"
        placeholder="Ví dụ: ReactJS..."
        disabled={isLoading}
      />

      <SimpleTopicSelect<TagInput>
        name="topicId"
        label="Thuộc chủ đề"
        control={control} // Giữ lại vì SimpleTopicSelect nhận prop này
        topics={topics}
        disabled={isLoading}
        allowSystemTag={true}
      />

      {/* Tương tự GenericField, StatusFormSelect tự lấy control từ context */}
      <StatusFormSelect disabled={isLoading} />
    </div>
  );
}
