// modules/post/schemas/postSchema.ts
import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .min(10, "Tiêu đề phải có ít nhất 10 ký tự"),
  content: z
    .string()
    .min(1, "Nội dung không được để trống")
    .min(30, "Nội dung quá ngắn, vui lòng mô tả chi tiết hơn"),
  topicId: z.string().min(1, "Vui lòng chọn một chuyên mục"),
  tags: z
    .array(
      z.object({
        name: z.string(),
        tagId: z.string().optional(),
        slug: z.string(),
      })
    )
    .min(1, "Vui lòng chọn ít nhất 1 tag")
    .max(5, "Tối đa chỉ được chọn 5 tags"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
