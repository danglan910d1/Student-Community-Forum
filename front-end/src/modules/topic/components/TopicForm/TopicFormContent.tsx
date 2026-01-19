"use client";

import { TopicInput } from "../../schemas/topicSchemas";
import { StatusFormSelect } from "@/components/shared/StatusSelect";
import { GenericField } from "@/components/shared/GenericField";

export function TopicFormContent({ isLoading }: { isLoading?: boolean }) {
  return (
    <div className="grid gap-5 py-2">
      <GenericField<TopicInput>
        name="name"
        label="Tên chủ đề"
        placeholder="Nhập tên chủ đề..."
        disabled={isLoading}
      />

      <GenericField<TopicInput>
        name="description"
        label="Mô tả"
        type="textarea"
        placeholder="Nhập mô tả..."
        disabled={isLoading}
      />

      <StatusFormSelect disabled={isLoading} />
    </div>
  );
}
