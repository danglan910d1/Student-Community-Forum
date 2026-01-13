"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Loader2, Save, Edit3, X } from "lucide-react";
import { ProfileFormValues } from "../../schemas/profileSchema";
import { PROFILE_FIELDS } from "../../constants/profile";

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

  const handleInternalSubmit = (values: ProfileFormValues) => {
    onSubmit(values);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Thanh điều khiển chế độ chỉnh sửa nội bộ Tab */}
      <div className="flex justify-end mb-4">
        {!isEditing ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Link href="/dashboard/profile">
              <Edit3 className="mr-2 h-4 w-4" />
              Chỉnh sửa hồ sơ
            </Link>
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
                render={({ field: inputProps }) => (
                  <FormItem
                    className={field.name === "avatar" ? "md:col-span-2" : ""}
                  >
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                      {field.label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...inputProps}
                        placeholder={field.placeholder}
                        disabled={!field.editable || !isEditing}
                        className={
                          !field.editable || !isEditing
                            ? "bg-muted/40 cursor-not-allowed border-dashed"
                            : "focus-visible:ring-primary"
                        }
                      />
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
