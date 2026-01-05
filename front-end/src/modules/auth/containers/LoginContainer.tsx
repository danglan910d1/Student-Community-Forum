// src/features/auth/containers/LoginContainer.tsx
"use client";

import { toast } from "sonner";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginContent } from "@/modules/auth/components/LoginContent";
import { useLoginMutation } from "@/modules/auth/hooks/useLoginMutation";
import { Form } from "@/components/ui/form";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { loginSchema, LoginInput } from "@/modules/auth/schemas/loginSchema";
import { authResponseHandle } from "@/modules/auth/utils/authResponseHandle";
import { useEffect } from "react";
import { AUTH_TEXT } from "../constant/authText";

export function LoginContainer() {
  const { LOGIN } = AUTH_TEXT;
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const methods = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: { email: "", password: "" },
  });

  const { mutate, isPending, error: serverError, reset } = useLoginMutation();

  useEffect(() => {
    return () => {
      reset(); // Gọi reset khi component unmount
    };
  }, [reset]);

  const onSubmit = (data: LoginInput) => {
    mutate(data, {
      onSuccess: (response) => {
        // Tận dụng handler cũ để lưu user/token vào Zustand & LocalStorage
        const userName = authResponseHandle.handleSuccess(response, setAuth);

        toast.success(LOGIN.SUCCESS_TOAST, {
          description: LOGIN.SUCCESS_DESCRIPTION(userName),
          duration: 3000,
        });

        router.push("/");
        router.refresh();
      },
    });
  };

  return (
    <>
      <FormProvider {...methods}>
        <Form {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <LoginContent isPending={isPending} serverError={serverError} />
          </form>
        </Form>
      </FormProvider>
    </>
  );
}
