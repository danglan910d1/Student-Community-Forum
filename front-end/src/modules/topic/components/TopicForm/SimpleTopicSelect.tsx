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
import { Globe, Folder } from "lucide-react";

// --- 1. COMPONENT HIỂN THỊ (Dùng cho Card hoặc nơi không có Form) ---
interface TopicSelectDisplayProps {
  value?: string;
  onChange: (val: string) => void;
  topics: ITopic[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  allowSystemTag?: boolean;
  error?: string;
}

export function TopicSelectDisplay({
  value,
  onChange,
  topics,
  label = "Chủ đề",
  placeholder = "Chọn chủ đề...",
  disabled = false,
  allowSystemTag = true,
  error,
}: TopicSelectDisplayProps) {
  return (
    <Field>
      {label && <FieldLabel className="font-bold text-md">{label}</FieldLabel>}
      <Select
        key={value}
        onValueChange={(val) => {
          // Logic "system_none" xử lý tập trung tại đây
          onChange(val === "system_none" ? "" : val);
        }}
        value={value || "system_none"}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowSystemTag && (
            <SelectItem
              value="system_none"
              className="text-blue-600 font-medium italic"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Thẻ hệ thống (Không có chủ đề)</span>
              </div>
            </SelectItem>
          )}

          {topics.map((t) => (
            <SelectItem key={String(t.topicId)} value={String(t.topicId)}>
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 opacity-50" />
                <span>{t.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

// --- 2. COMPONENT FORM (Dùng trong UpdateTagContainer / CreateTag) ---
interface SimpleTopicSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  topics: ITopic[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  allowSystemTag?: boolean;
}

export function SimpleTopicSelect<T extends FieldValues>({
  control,
  name,
  ...restProps // Gom các props còn lại (topics, label,...) để truyền xuống Display
}: SimpleTopicSelectProps<T>) {
  // Hook useController luôn được gọi, không nằm trong if
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  return (
    <TopicSelectDisplay
      {...restProps}
      value={value}
      onChange={onChange}
      error={error?.message}
    />
  );
}
