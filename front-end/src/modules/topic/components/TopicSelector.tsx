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
}

export function TopicSelector<T extends FieldValues>({
  control,
  name,
  topics,
  onTopicChange,
  label = "Chủ đề (Topic)",
  placeholder = "Chọn một chuyên mục...",
}: TopicSelectorProps<T>) {
  const {
    field: { value, onChange },
    fieldState,
  } = useController({
    name,
    control,
    rules: { required: "Vui lòng chọn một chuyên mục" },
  });

  const isInvalid = !!fieldState.error;

  return (
    <Field>
      <FieldLabel htmlFor={name} className="font-bold text-md">
        {label}
      </FieldLabel>

      <Select
        onValueChange={(val) => {
          onChange(val);
          onTopicChange(val);
        }}
        value={value}
      >
        <SelectTrigger
          id={name}
          // Thêm aria-invalid để đồng bộ logic với MultiAutocomplete
          aria-invalid={isInvalid}
          className={`w-full rounded-sm h-11 ${
            isInvalid ? "border-red-500 focus:ring-red-500" : "border-border"
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent
          position="popper"
          className="w-[var(--radix-select-trigger-width)] max-h-[300px]"
        >
          {topics.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              Không có dữ liệu chủ đề
            </div>
          ) : (
            topics.map((t) => (
              <SelectItem key={t.topicId} value={t.topicId}>
                {t.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {fieldState.error && (
        <FieldError className="italic">{fieldState.error.message}</FieldError>
      )}
    </Field>
  );
}
