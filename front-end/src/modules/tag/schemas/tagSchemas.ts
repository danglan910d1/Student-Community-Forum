import * as z from "zod";

export const tagSchema = z.object({
  name: z
    .string()
    .min(1, "Tên thẻ không được để trống")
    .max(50, "Tên thẻ không quá 50 ký tự"),
  topicId: z.string().nullable().default(null),
  status: z.enum(["approved", "pending", "rejected"]).default("approved"),
});

export type TagInput = z.infer<typeof tagSchema>;
