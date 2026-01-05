import { z } from "zod";
import { AUTH_TEXT } from "../constant/authText";

const { EMAIL_REQUIRED, PASSWORD_REQUIRED, EMAIL_INVALID } =
  AUTH_TEXT.VALIDATION;

export const loginSchema = z.object({
  email: z.string().min(1, EMAIL_REQUIRED).email(EMAIL_INVALID),
  password: z.string().min(1, PASSWORD_REQUIRED),
});

export type LoginInput = z.infer<typeof loginSchema>;
