// types/notification/enums.ts
export enum NotificationType {
  // Luồng Admin -> User
  POST_APPROVED = "post_approved",
  POST_REJECTED = "post_rejected",

  // Luồng User -> Admin
  POST_SUBMITTED = "post_submitted",

  // Luồng User -> User
  NEW_COMMENT = "new_comment",
  NEW_REPLY = "new_reply",
  NEW_LIKE = "new_like",

  // Hệ thống
  SYSTEM_ALERT = "system_alert",
}

export type EntityType = "post" | "comment";
