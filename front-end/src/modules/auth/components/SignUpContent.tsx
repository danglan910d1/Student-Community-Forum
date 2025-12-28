"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { FieldGroup, FieldDescription } from "@/components/ui/field";
import { AUTH_TEXT } from "../constant/authText";
import { SignupInput } from "../schemas/signUpSchema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthSkeleton from "./shared/AuthSkeleton";
import { useTransition } from "react";
import { AuthContentProps } from "../types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { authResponseHandle } from "../utils/authResponseHandle";

export function SignupFormContent({
  isPending,
  serverError,
}: AuthContentProps) {
  const { SIGNUP } = AUTH_TEXT;
  const { control } = useFormContext<SignupInput>();

  const [isNavigating, startTransition] = useTransition();
  const router = useRouter();

  const handleSwitchPage = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push("/auth/login");
    });
  };

  // Nếu đang chuyển trang, chúng ta có thể ép hiển thị Skeleton ngay tại đây
  if (isNavigating) return <AuthSkeleton />;

  return (
    <FieldGroup className="animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-2 text-center mb-2">
        <h1 className="text-2xl font-bold">{SIGNUP.TITLE}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {SIGNUP.DESCRIPTION}
        </p>
      </div>

      {/* Trường Họ và tên */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{SIGNUP.NAME_LABEL}</FormLabel>
            <FormControl>
              <Input
                placeholder={SIGNUP.NAME_PLACEHOLDER}
                disabled={isPending}
                {...field}
              />
            </FormControl>
            <FormMessage /> {/* Tự động hiện lỗi từ Zod */}
          </FormItem>
        )}
      />

      {/* Trường Email */}
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{SIGNUP.EMAIL_LABEL}</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder={SIGNUP.EMAIL_PLACEHOLDER}
                disabled={isPending}
                {...field}
              />
            </FormControl>
            <FormDescription>{SIGNUP.EMAIL_DESC}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Cụm Mật khẩu & Xác nhận */}
      <div className="grid gap-2">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{SIGNUP.PASSWORD_LABEL}</FormLabel>
                <FormControl>
                  <Input type="password" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{SIGNUP.CONFIRM_PASSWORD_LABEL}</FormLabel>
                <FormControl>
                  <Input type="password" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormDescription>{SIGNUP.PASSWORD_DESC}</FormDescription>
      </div>

      <Button
        type="submit"
        isLoading={isPending}
        loadingText="Loading..." // Nếu bỏ dòng này thì chỉ hiện mỗi Spinner xoay
        className="w-full mt-2"
      >
        {SIGNUP.SUBMIT_BTN}
      </Button>

      {serverError && !isPending && (
        <Alert
          variant="destructive"
          className="animate-in fade-in zoom-in duration-200"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi đăng ký</AlertTitle>
          <AlertDescription>
            {authResponseHandle.handleError(serverError)}
          </AlertDescription>
        </Alert>
      )}

      <FieldDescription className="text-center mt-4">
        {SIGNUP.HAVE_ACCOUNT}{" "}
        <Link
          href="/auth/login"
          prefetch={false}
          className="underline underline-offset-4 font-medium hover:text-primary"
          onClick={handleSwitchPage}
        >
          {SIGNUP.SIGN_IN_LINK}
        </Link>
      </FieldDescription>
    </FieldGroup>
  );
}
