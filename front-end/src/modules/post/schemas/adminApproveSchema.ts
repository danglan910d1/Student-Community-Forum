// import { z } from "zod";

// export const adminApproveSchema = z
//   .object({
//     newPostStatus: z.enum(["approved", "rejected"]),
//     reason: z.string().optional(),
//     // Kiểm tra mảng hành động tag: Số lượng hành động phải khớp với số lượng pending_tags
//     pendingTagActions: z.array(
//       z.object({
//         tagId: z.string(),
//         action: z.enum([
//           "approve_and_add_topic",
//           "approve_and_mark_free",
//           "approve_topic_and_reject_from_post",
//           "approve_global_and_reject_from_post",
//           "reject_tag",
//         ]),
//       })
//     ),
//     keepTagIds: z.array(z.string()),
//   })
//   .refine(
//     (data) => {
//       // Nếu từ chối bài viết, bắt buộc phải có lý do
//       if (
//         data.newPostStatus === "rejected" &&
//         (!data.reason || data.reason.length < 5)
//       ) {
//         return false;
//       }
//       return true;
//     },
//     {
//       message: "Vui lòng nhập lý do từ chối (ít nhất 5 ký tự)",
//       path: ["reason"],
//     }
//   );

// export type AdminApproveInput = z.infer<typeof adminApproveSchema>;

import { z } from "zod";

export const adminApproveSchema = z.object({
  newPostStatus: z.enum(["approved", "rejected"]),
  reason: z.string().optional(), // Để optional, không validate độ dài
  keepTagIds: z.array(z.string()),
  pendingTagActions: z.array(
    z.object({
      tagId: z.string(),
      action: z.enum([
        "approve_and_add_topic",
        "approve_and_mark_free",
        "approve_topic_and_reject_from_post",
        "approve_global_and_reject_from_post",
        "reject_tag",
      ]),
    })
  ),
});

export type AdminApproveInput = z.infer<typeof adminApproveSchema>;
