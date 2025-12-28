import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(1, "Họ và tên không được để trống"),
    email: z
      .string()
      .min(1, "Email không được để trống")
      .email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận lại mật khẩu"), // Đổi tên ở đây
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"], // Trỏ lỗi về đúng ô nhập lại mật khẩu
  });

export type SignupInput = z.infer<typeof signupSchema>;
