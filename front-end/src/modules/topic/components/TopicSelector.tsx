"use client";

import { Control, useController, FieldValues, Path } from "react-hook-form";
import { ITopic } from "@/modules/topic/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

interface TopicSelectorProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  topics: ITopic[];
  onTopicChange: (id: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function TopicSelector<T extends FieldValues>({
  control,
  name,
  topics,
  onTopicChange,
  label = "Chủ đề (Topic)",
  placeholder = "Chọn một chuyên mục...",
  disabled = false,
}: TopicSelectorProps<T>) {
  const {
    field: { value, onChange },
    fieldState,
  } = useController({
    name,
    control,
    rules: { required: "Vui lòng chọn một chuyên mục" },
  });

  return (
    <Field>
      <FieldLabel className="font-bold text-md">{label}</FieldLabel>
      <Select
        key={value} // Thêm dòng này để Select re-render khi giá trị value thay đổi
        onValueChange={(val) => {
          onChange(val);
          if (onTopicChange) onTopicChange(val);
        }}
        value={value || ""}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {topics.map((t) => (
            // Cực kỳ quan trọng: value={t.topicId} để khớp với reset
            <SelectItem key={String(t.topicId)} value={String(t.topicId)}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
    </Field>
  );
}
