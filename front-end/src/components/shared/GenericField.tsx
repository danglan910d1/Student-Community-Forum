"use client";

import {
  useFormContext,
  useFormState,
  Path,
  FieldValues,
} from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface GenericFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  type?: "input" | "textarea";
  rows?: number;
}

export function GenericField<T extends FieldValues>({
  name,
  label,
  placeholder,
  disabled = false,
  type = "input",
  rows = 4,
}: GenericFieldProps<T>) {
  const { register, control } = useFormContext<T>();

  /**
   * KHÔNG truyền 'name' vào đây.
   * Khi không có 'name', hook này sẽ lắng nghe TOÀN BỘ sự thay đổi của Form.
   * Điều này đảm bảo khi hàm trigger() chạy ở Container,
   * TẤT CẢ các GenericField sẽ cùng nhận được thông báo lỗi một lúc.
   */
  const { errors } = useFormState({ control });

  const error = errors[name]?.message as string | undefined;

  return (
    <Field>
      <FieldLabel htmlFor={name as string} className="font-bold text-md">
        {label}
      </FieldLabel>

      {type === "input" ? (
        <Input
          id={name as string}
          {...register(name)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "border h-11 rounded-sm transition-colors",
            error ? "border-red-500 focus-visible:ring-red-500" : "",
          )}
        />
      ) : (
        <Textarea
          id={name as string}
          {...register(name)}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            "border rounded-sm transition-colors resize-none",
            error ? "border-red-500 focus-visible:ring-red-500" : "",
          )}
        />
      )}

      {/* Dùng key để ép React render lại DOM khi message thay đổi */}
      {error && <FieldError key={name as string}>{error}</FieldError>}
    </Field>
  );
}
