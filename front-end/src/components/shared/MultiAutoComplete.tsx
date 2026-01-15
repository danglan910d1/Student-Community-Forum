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
  const [open, setOpen] = React.useState(false); // Điều khiển trạng thái đóng/mở

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " && inputValue.trim() !== "") {
      e.preventDefault();
      if (isLimitReached || disabled) return;

      const tagName = inputValue.trim();
      const tagSlug = tagName.toLowerCase().replace(/\s+/g, "-");

      if (!value.some((v: Tag) => v.slug === tagSlug)) {
        onChange([
          ...value,
          { tagId: `temp-${Date.now()}`, name: tagName, slug: tagSlug },
        ]);
        setOpen(false); // Đóng menu sau khi "tạo" tag bằng phím cách
      }
      setInputValue("");
    }
  };

  const handleValueChange = React.useCallback(
    (nextSlugs: string[] | unknown) => {
      const slugs = nextSlugs as string[];

      const nextValue: Tag[] = slugs
        .map(
          (slug) =>
            value.find((v: Tag) => v.slug === slug) ||
            topicTags.find((t) => t.slug === slug) ||
            systemTags.find((t) => t.slug === slug)
        )
        .filter(Boolean) as Tag[];

      if (nextValue.length <= max) {
        onChange(nextValue);
        setOpen(false); // ĐÓNG MENU NGAY SAU KHI CHỌN
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
