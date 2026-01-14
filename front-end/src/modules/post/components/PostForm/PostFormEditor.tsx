// modules/post/components/PostForm/PostFormEditor.tsx
"use client";

import { useFormContext, Controller, Path, FieldValues } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import MDEditor from "@uiw/react-md-editor";

interface PostFormEditorProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  disabled?: boolean;
}

export function PostFormEditor<T extends FieldValues>({
  name,
  label,
  disabled = false,
}: PostFormEditorProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name]?.message as string | undefined;

  return (
    <Field>
      <FieldLabel className="font-bold text-md">{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div
            className={`border rounded-sm overflow-hidden ${error ? "border-red-500" : ""}`}
          >
            <MDEditor
              {...field}
              height={400}
              preview={disabled ? "preview" : "edit"}
              aria-disabled={disabled}
            />
          </div>
        )}
      />
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
