"use client";

import { toast } from "sonner";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupFormContent } from "@/modules/auth/components/SignUpContent";
import { useSignupMutation } from "@/modules/auth/hooks/useSignUpMutation";
import { Form } from "@/components/ui/form";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import {
  AuthResponse,
  SignupRequest,
  SignupFormInput,
} from "@/modules/auth/types";
import { signupSchema } from "@/modules/auth/schemas/signUpSchema";
import { authResponseHandle } from "@/modules/auth/utils/authResponseHandle";
import { useEffect } from "react";
import { AUTH_TEXT } from "../constant/authText";

export function SignupContainer() {
  const { SIGNUP } = AUTH_TEXT;
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

        toast.success(SIGNUP.SUCCESS_TOAST, {
          description: SIGNUP.SUCCESS_DESCRIPTION(userName),
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
