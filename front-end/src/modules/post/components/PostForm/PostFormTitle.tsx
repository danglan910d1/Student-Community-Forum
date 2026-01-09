// modules/post/components/PostForm/PostFormTitle.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Path, FieldValues } from "react-hook-form";

interface PostFormTitleProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
}

export function PostFormTitle<T extends FieldValues>({
  name,
  label,
  placeholder,
}: PostFormTitleProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  // Lấy error message dựa trên name (hỗ trợ cả nested object nếu có)
  const error = errors[name]?.message as string | undefined;

  return (
    <Field>
      <FieldLabel htmlFor={name as string} className="font-bold text-md">
        {label}
      </FieldLabel>
      <Input
        id={name as string}
        {...register(name)}
        placeholder={placeholder}
        className={`border h-11 rounded-sm ${error ? "border-red-500" : ""}`}
      />
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
