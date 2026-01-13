import * as z from "zod";

// Schema cho Profile
export const profileSchema = z.object({
  name: z.string().min(2, "Tên phải ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  avatar: z.any().optional(), // Chấp nhận File hoặc URL string
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Schema cho Password
export const passwordSchema = z
  .object({
    oldPassword: z.string().min(6, "Mật khẩu hiện tại phải từ 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu mới phải từ 6 ký tự"),
    confirmPassword: z.string().min(6, "Vui lòng xác nhận lại mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;
