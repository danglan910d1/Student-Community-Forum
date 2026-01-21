"use client";

import * as React from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { generateSlug } from "@/modules/post/utils/slug";
import { toast } from "sonner";

export interface Tag {
  tagId: string;
  name: string;
  slug: string;
}

interface MultiAutocompleteProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  topicTags: Tag[];
  systemTags: Tag[];
  max?: number;
  label?: string;
  placeholder?: string;
  topicLabel?: string;
  systemLabel?: string;
  emptyErrorMsg?: string;
  disabled?: boolean;
}

export default function MultiAutocomplete<T extends FieldValues>({
  name,
  control,
  topicTags = [],
  systemTags = [],
  max = 5,
  label = "Tags bài viết",
  placeholder = "Chọn tags...",
  topicLabel = "Tag thuộc topic",
  systemLabel = "Tag thuộc hệ thống",
  emptyErrorMsg = "Vui lòng chọn ít nhất 1 mục",
  disabled = false,
}: MultiAutocompleteProps<T>) {
  const [inputValue, setInputValue] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const {
    field: { value = [], onChange },
    fieldState,
  } = useController({
    name,
    control,
    rules: {
      validate: (val: Tag[]) => val.length > 0 || emptyErrorMsg,
    },
  });

  const isLimitReached = value.length >= max;

  // 1. XỬ LÝ KHI NHẤN PHÍM CÁCH (TẠO TAG MỚI)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Chấp nhận Space hoặc Enter để hoàn tất Tag
    if ((e.key === " " || e.key === "Enter") && inputValue.trim() !== "") {
      e.preventDefault();
      if (isLimitReached || disabled) return;

      const tagName = inputValue.trim();
      const tagSlug = generateSlug(tagName); // Ví dụ: "nodejs"

      /**
       * BƯỚC 1: Kiểm tra trùng lặp trong danh sách ĐÃ CHỌN
       * So sánh slug sau khi san phẳng để bắt được cả "Node JS" lẫn "nodejs"
       */
      const isAlreadySelected = value.some(
        (v: Tag) =>
          generateSlug(v.name) === tagSlug || generateSlug(v.slug) === tagSlug
      );

      if (isAlreadySelected) {
        toast.error(`Thẻ "${tagName}" đã có trong danh sách chọn.`);
        setInputValue("");
        return;
      }

      /**
       * BƯỚC 2: Kiểm tra chéo với Tag Hệ thống (Topic Tags + System Tags)
       * Nếu người dùng gõ trùng với một Tag đã tồn tại, hãy dùng dữ liệu của hệ thống
       * để lấy được tagId chuẩn, giúp Backend không phải xử lý tạo mới (Pending).
       */
      const existingSystemTag = [...topicTags, ...systemTags].find(
        (t) =>
          generateSlug(t.name) === tagSlug || generateSlug(t.slug) === tagSlug
      );

      if (existingSystemTag) {
        // Nếu tìm thấy tag hệ thống, dùng tag đó luôn (có đầy đủ tagId, slug chuẩn)
        onChange([...value, existingSystemTag]);
      } else {
        // Nếu là tag hoàn toàn mới, tạo object tạm (tagId để rỗng để BE xử lý insert)
        onChange([
          ...value,
          {
            tagId: "", // Backend sẽ nhận diện đây là tag mới và chạy processTags
            name: tagName,
            slug: tagSlug,
          },
        ]);
      }

      setInputValue("");
      setOpen(false); // Đóng dropdown gợi ý
    }
  };
  // 2. XỬ LÝ KHI CHỌN TỪ DANH SÁCH (COMBOBOX ITEM)
  const handleValueChange = React.useCallback(
    (nextSlugs: string[] | unknown) => {
      const slugs = nextSlugs as string[];

      // Lọc bỏ các slug trùng lặp trước khi map
      const uniqueSlugs = Array.from(new Set(slugs));

      const nextValue: Tag[] = uniqueSlugs
        .map(
          (slug) =>
            value.find((v: Tag) => v.slug === slug) ||
            topicTags.find((t) => t.slug === slug) ||
            systemTags.find((t) => t.slug === slug)
        )
        .filter(Boolean) as Tag[];

      if (nextValue.length <= max) {
        onChange(nextValue);
        setOpen(false);
      }
    },
    [value, topicTags, systemTags, max, onChange]
  );

  const anchorRef = useComboboxAnchor();
  const isInvalid = !!fieldState.error;

  return (
    <Field>
      <FieldLabel className="text-md font-bold" htmlFor={name}>
        {label}
      </FieldLabel>

      <Combobox
        multiple
        open={open}
        onOpenChange={setOpen} // Lắng nghe sự kiện đóng mở
        value={value.map((v: Tag) => v.slug)}
        onValueChange={handleValueChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
      >
        <ComboboxChips
          onKeyDown={handleKeyDown}
          ref={anchorRef}
          className={
            isInvalid
              ? "border-red-500 focus-within:ring-1 focus-within:ring-red-500"
              : ""
          }
        >
          {value.map((v: Tag) => (
            <ComboboxChip key={v.slug} value={v.slug} showRemove={!disabled}>
              {v.name}
            </ComboboxChip>
          ))}

          <ComboboxChipsInput
            id={name}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled || isLimitReached}
            onFocus={() => !disabled && setOpen(true)}
          />
        </ComboboxChips>

        <ComboboxContent anchor={anchorRef}>
          <ComboboxList>
            {topicTags.length > 0 && (
              <ComboboxGroup>
                <ComboboxLabel>{topicLabel}</ComboboxLabel>
                {topicTags.map((tag) => (
                  <ComboboxItem key={tag.slug} value={tag.slug}>
                    {tag.name}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            )}

            {systemTags.length > 0 && (
              <ComboboxGroup>
                <ComboboxLabel>{systemLabel}</ComboboxLabel>
                {systemTags.map((tag) => (
                  <ComboboxItem key={tag.slug} value={tag.slug}>
                    {tag.name}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
    </Field>
  );
}
