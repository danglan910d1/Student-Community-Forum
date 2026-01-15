"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Lock, ArrowRight, Loader2 } from "lucide-react";

// Import Schema và Hook của bạn
import {
  passwordSchema,
  PasswordFormValues,
} from "../../schemas/profileSchema";
import { PASSWORD_FIELDS } from "../../constants/profile";
import { useUpdatePassword } from "../../hooks/useUpdatePassword";

export function PasswordTabContent() {
  // 1. Sử dụng hook Mutation đã có
  const { mutate: updatePassword, isPending } = useUpdatePassword();

  // 2. Khởi tạo form với useForm
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // 3. Hàm xử lý submit
  const onSubmit = (values: PasswordFormValues) => {
    updatePassword(
      { data: values },
      {
        onSuccess: () => {
          // Reset form về trạng thái trống sau khi đổi mật khẩu thành công
          form.reset();
        },
      }
    );
  };

  return (
    <div className="space-y-8 py-2 animate-in slide-in-from-bottom-2 duration-500">
      {/* Thông báo bảo mật */}
      <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30">
        <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-bold text-amber-900 dark:text-amber-500">
            Khuyến nghị bảo mật
          </h3>
          <p className="text-sm text-amber-800/70 dark:text-amber-600">
            Sử dụng ít nhất 8 ký tự, bao gồm chữ cái và số để bảo vệ tài khoản
            của bạn.
          </p>
        </div>
      </div>

      {/* 4. Form Context */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-md space-y-6"
        >
          {PASSWORD_FIELDS.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: inputProps }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                    {field.label}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...inputProps}
                      type="password"
                      placeholder={field.placeholder}
                      disabled={isPending} // Disable khi đang call API
                      className="bg-muted/20 focus-visible:ring-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium text-destructive" />
                </FormItem>
              )}
            />
          ))}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full sm:w-auto group min-w-[160px]"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}

              {isPending ? "Đang xử lý..." : "Cập nhật mật khẩu"}

              {!isPending && (
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="h-[1px] bg-border w-full mt-10" />
      <p className="text-xs text-muted-foreground italic">
        * Sau khi đổi mật khẩu, bạn có thể cần phải đăng nhập lại trên các thiết
        bị khác.
      </p>
    </div>
  );
}
