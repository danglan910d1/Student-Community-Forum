// src/features/auth/components/LoginFormContent.tsx
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
} from "@/components/ui/form";
import { FieldGroup, FieldDescription } from "@/components/ui/field";
import { LoginInput } from "@/modules/auth/schemas/loginSchema";
import { AUTH_TEXT } from "@/modules/auth/constant/authText";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import AuthSkeleton from "@/modules/auth/components/AuthSkeleton";
import { AuthContentProps } from "@/modules/auth/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { authResponseHandle } from "@/modules/auth/utils/authResponseHandle";

export function LoginContent({ isPending, serverError }: AuthContentProps) {
  const { LOGIN } = AUTH_TEXT;
  const { control } = useFormContext<LoginInput>();
  const [isNavigating, startTransition] = useTransition();
  const router = useRouter();

  const handleSwitchPage = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push("/auth/register");
    });
  };

  // Nếu đang chuyển trang, chúng ta có thể ép hiển thị Skeleton ngay tại đây
  if (isNavigating) return <AuthSkeleton />;

  return (
    <FieldGroup>
      <div className="flex flex-col items-center gap-2 text-center mb-2">
        <h1 className="text-2xl font-bold">{LOGIN.TITLE}</h1>
        <p className="text-muted-foreground text-sm">{LOGIN.DESCRIPTION}</p>
      </div>

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{LOGIN.EMAIL_LABEL}</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder={LOGIN.EMAIL_PLACEHOLDER}
                disabled={isPending}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>{LOGIN.PASSWORD_LABEL}</FormLabel>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-2 hover:underline hover:text-primary"
              >
                {LOGIN.FORGOT_PASSWORD}
              </a>
            </div>
            <FormControl>
              <Input type="password" disabled={isPending} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="submit"
        isLoading={isPending}
        loadingText={LOGIN.LOADING_TEXT} // Nếu bỏ dòng này thì chỉ hiện mỗi Spinner xoay
        className="w-full mt-2"
      >
        {LOGIN.SUBMIT_BTN}
      </Button>

      {serverError && !isPending && (
        <Alert
          variant="destructive"
          className="animate-in fade-in zoom-in duration-200"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{LOGIN.ERROR_TITLE}</AlertTitle>
          <AlertDescription>
            {authResponseHandle.handleError(serverError)}
          </AlertDescription>
        </Alert>
      )}

      <FieldDescription className="text-center mt-4">
        {LOGIN.NO_ACCOUNT}{" "}
        <Link
          href="/auth/register"
          className="underline underline-offset-4 font-medium hover:text-primary"
          onClick={handleSwitchPage}
        >
          {LOGIN.SIGN_UP_LINK}
        </Link>
      </FieldDescription>
    </FieldGroup>
  );
}
