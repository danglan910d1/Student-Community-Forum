import { z } from "zod";
import { signupSchema } from "../schemas/signUpSchema";
import { loginSchema } from "../schemas/loginSchema";
import { AxiosError } from "axios";
import { IAuthor } from "@/types/common";

// --- Form & Request Types ---
export type SignupFormInput = z.infer<typeof signupSchema>;
export type SignupRequest = Omit<SignupFormInput, "confirmPassword">;

export type LoginInput = z.infer<typeof loginSchema>;
export type LoginRequest = LoginInput;

// --- API Response Types ---
// AuthResponse gắn liền với hành động Login/Register vì nó có Token
export interface AuthResponse extends IAuthor {
  token: string;
}

// --- UI State Types ---
export interface AuthContentProps {
  isPending: boolean;
  serverError: AxiosError<{ message: string }> | null;
}
