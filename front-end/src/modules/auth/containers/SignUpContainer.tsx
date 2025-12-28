"use client";

import { toast } from "sonner";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "../components/shared/AuthLayout";
import { SignupFormContent } from "../components/SignUpContent";
import { useSignupMutation } from "../hooks/useSignUpMutation";
import { Form } from "@/components/ui/form";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { AuthResponse, SignupRequest, SignupFormInput } from "../types";
import { signupSchema } from "../schemas/signUpSchema";
import { authResponseHandle } from "../utils/authResponseHandle";
import { useEffect } from "react";

export function SignupContainer() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const methods = useForm<SignupFormInput>({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending, error: serverError, reset } = useSignupMutation();

  useEffect(() => {
    return () => {
      reset(); // Gọi reset khi component unmount
    };
  }, [reset]);

  const onSubmit = (data: SignupFormInput) => {
    const { confirmPassword, ...payload } = data;
    mutate(payload as SignupRequest, {
      onSuccess: (response: AuthResponse) => {
        console.log(response);
        const userName = authResponseHandle.handleSuccess(response, setAuth);

        toast.success("Đăng ký thành công!", {
          description: `Chào mừng ${userName} đã gia nhập cộng đồng.`,
          duration: 3000, // Tự động đóng sau 3 giây
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
            <SignupFormContent
              isPending={isPending}
              serverError={serverError}
            />
          </form>
        </Form>
      </FormProvider>
    </>
  );
}
