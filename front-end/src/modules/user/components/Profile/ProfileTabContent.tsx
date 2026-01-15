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
  isMine,
}: ProfileTabContentProps & { isMine: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const visibleFields = fields.filter((field) => {
    if (isMine) return true; // Nếu là tôi, xem hết
    return field.name !== "email"; // Nếu là khách, ẩn email đi (vì backend cũng không trả về)
  });
  return (
    <div className="space-y-6">
      {/* 1. Nút điều khiển Edit chỉ hiện khi là chính chủ */}
      {isMine && (
        <div className="flex justify-end mb-4">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa hồ sơ
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                form.reset();
              }}
            >
              <X className="mr-2 h-4 w-4" /> Hủy bỏ
            </Button>
          )}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleFields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem
                    className={field.name === "avatar" ? "md:col-span-2" : ""}
                  >
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground">
                      {field.label}
                    </FormLabel>
                    <FormControl>
                      {field.name === "avatar" ? (
                        <div className="flex items-center gap-5 p-4 border rounded-lg bg-muted/10">
                          <Avatar className="h-20 w-20 border-2 border-primary/20">
                            <AvatarImage
                              src={
                                previewUrl ||
                                (typeof value === "string" && value
                                  ? getAssetUrl(value)
                                  : undefined)
                              }
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {form
                                .getValues("name")
                                ?.substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {/* 2. Chỉ hiện nút thay ảnh khi isMine và đang isEditing */}
                          {isMine && isEditing && (
                            <div className="space-y-2">
                              <Input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    onChange(file);
                                    setPreviewUrl(URL.createObjectURL(file));
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Camera className="mr-2 h-4 w-4" /> Thay đổi ảnh
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Input
                          {...fieldProps}
                          value={value as string}
                          onChange={onChange}
                          // 3. Khóa input nếu không có quyền sở hữu HOẶC không trong mode edit
                          disabled={!isMine || !isEditing || !field.editable}
                          className={
                            !isMine || !isEditing || !field.editable
                              ? "bg-muted/40 cursor-not-allowed border-dashed"
                              : ""
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

          {/* 4. Nút SAVE chỉ hiện khi isMine và isEditing */}
          {isMine && isEditing && (
            <div className="flex justify-end pt-4 border-t">
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
