// src/features/auth/hooks/useLoginMutation.ts
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/modules/auth/services/authService";
import { AuthResponse, LoginRequest } from "@/modules/auth/types";
import { AxiosError } from "axios";

export const useLoginMutation = () => {
  return useMutation<
    AuthResponse,
    AxiosError<{ message: string }>,
    LoginRequest
  >({
    mutationFn: authService.login,
  });
};
