// src/features/auth/containers/LoginContainer.tsx
"use client";

import { toast } from "sonner";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "../components/shared/AuthLayout";
import { LoginContent } from "../components/LoginContent";
import { useLoginMutation } from "../hooks/useLoginMutation";
import { Form } from "@/components/ui/form";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { loginSchema, LoginInput } from "../schemas/loginSchema";
import { authResponseHandle } from "../utils/authResponseHandle";
import { useEffect } from "react";

export function LoginContainer() {
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

        toast.success("Đăng nhập thành công!", {
          description: `Chào mừng ${userName} đã quay trở lại.`,
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
