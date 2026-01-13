import { useMutation } from "@tanstack/react-query";
import { authService } from "@/modules/auth/services/authService";
import { AuthResponse, SignupRequest } from "@/modules/auth/types";
import { AxiosError } from "axios";

export const useSignupMutation = () => {
  // useMutation<Kiểu_Trả_Về, Kiểu_Lỗi, Kiểu_Payload>
  return useMutation<
    AuthResponse,
    AxiosError<{ message: string }>,
    SignupRequest
  >({
    mutationFn: authService.register,
  });
};
