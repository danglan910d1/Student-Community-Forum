// src/modules/notifications/types.ts

import { IAuthor } from "@/types/common";

// Khớp hoàn toàn với enum NotificationType ở BE
export type NotificationType =
  | "post_approved"
  | "post_rejected"
  | "new_comment"
  | "new_reply"
  | "new_like"
  | "system_alert";

export interface INotification {
  notificationId: string;
  recipientId: string;
  sender?: IAuthor | null; // Có thể null nếu là system_alert
  type: NotificationType;
  targetId: string; // Backend Pipeline đã đổi entityId -> targetId
  targetType: "post" | "comment"; // Backend enum: ["post", "comment"]
  content: string;
  is_read: boolean;
  createdAt: string;
}

// Cấu trúc Response đặc thù của Notification Controller
export interface IGetNotificationsResponse {
  notifications: INotification[];
  unreadCount: number;
}
