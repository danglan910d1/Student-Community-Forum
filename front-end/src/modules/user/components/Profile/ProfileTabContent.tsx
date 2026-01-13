"use client";

import { useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Edit3, X, Camera } from "lucide-react";
import { ProfileFormValues } from "../../schemas/profileSchema";
import { PROFILE_FIELDS } from "../../constants/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAssetUrl } from "@/lib/utils";

interface ProfileTabContentProps {
  form: UseFormReturn<ProfileFormValues>;
  onSubmit: (values: ProfileFormValues) => void;
  isUpdating: boolean;
  fields: typeof PROFILE_FIELDS;
}

export function ProfileTabContent({
  form,
  onSubmit,
  isUpdating,
  fields,
}: ProfileTabContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý xem trước ảnh khi chọn file
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInternalSubmit = (values: ProfileFormValues) => {
    onSubmit(values);
    setIsEditing(false);

    // Giải phóng bộ nhớ của URL tạm thời
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Chỉnh sửa hồ sơ
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsEditing(false);
              form.reset();
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Hủy bỏ
          </Button>
        )}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleInternalSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem
                    className={field.name === "avatar" ? "md:col-span-2" : ""}
                  >
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                      {field.label}
                    </FormLabel>
                    <FormControl>
                      {field.name === "avatar" ? (
                        <div className="flex items-center gap-5 p-4 border rounded-lg bg-muted/10">
                          <Avatar className="h-20 w-20 border-2 border-primary/20">
                            <AvatarImage
                              src={
                                previewUrl || // Nếu có ảnh mới chọn thì dùng link blob (không cần xử lý)
                                (typeof value === "string" && value
                                  ? getAssetUrl(value) // BẮT BUỘC dùng hàm này để nối port 5000
                                  : undefined)
                              }
                              alt={form.getValues("name")}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/5 text-lg">
                              {form
                                .getValues("name")
                                ?.substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {isEditing && (
                            <div className="space-y-2">
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    onChange(file); // Lưu File object vào Form
                                    setPreviewUrl(URL.createObjectURL(file)); // Tạo link xem tạm thời
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Camera className="mr-2 h-4 w-4" />
                                Thay đổi ảnh đại diện
                              </Button>
                              <p className="text-[10px] text-muted-foreground">
                                JPG, PNG hoặc WebP. Tối đa 2MB.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Input
                          {...fieldProps}
                          value={value as string}
                          onChange={onChange}
                          placeholder={field.placeholder}
                          disabled={!field.editable || !isEditing}
                          className={
                            !field.editable || !isEditing
                              ? "bg-muted/40 cursor-not-allowed border-dashed"
                              : "focus-visible:ring-primary"
                          }
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          {isEditing && (
            <div className="flex justify-end pt-4 border-t animate-in slide-in-from-top-2">
              <Button
                type="submit"
                disabled={isUpdating}
                className="min-w-[140px]"
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Lưu thay đổi
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
