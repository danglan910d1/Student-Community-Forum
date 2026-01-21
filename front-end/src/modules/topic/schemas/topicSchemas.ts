import * as z from "zod";

// 1. Tách riêng Enum để export Type (Tránh lỗi any khi map dữ liệu từ API)
export const TopicStatusEnum = z.enum(["approved", "pending", "rejected"]);
export type TopicStatus = z.infer<typeof TopicStatusEnum>;

export const topicSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên chủ đề không được để trống")
    .min(2, "Tên chủ đề phải có ít nhất 2 ký tự"),
  description: z.string().trim().min(1, "Mô tả không được để trống"),
  // Sử dụng biến Enum đã khai báo ở trên
  status: TopicStatusEnum.default("approved"),
});

export type TopicInput = z.infer<typeof topicSchema>;
