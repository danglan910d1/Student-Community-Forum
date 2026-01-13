import { z } from "zod";
import { AUTH_TEXT } from "../constant/authText";

const {
  NAME_REQUIRED,
  EMAIL_REQUIRED,
  EMAIL_INVALID,
  PASSWORD_MIN,
  CONFIRM_PASSWORD_MISMATCH,
  CONFIRM_PASSWORD_REQUIRED,
} = AUTH_TEXT.VALIDATION;

export const signupSchema = z
  .object({
    name: z.string().min(1, NAME_REQUIRED),
    email: z.string().min(1, EMAIL_REQUIRED).email(EMAIL_INVALID),
    password: z.string().min(8, PASSWORD_MIN),
    confirmPassword: z.string().min(1, CONFIRM_PASSWORD_REQUIRED), // Đổi tên ở đây
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: CONFIRM_PASSWORD_MISMATCH,
    path: ["confirmPassword"], // Trỏ lỗi về đúng ô nhập lại mật khẩu
  });

export type SignupInput = z.infer<typeof signupSchema>;
