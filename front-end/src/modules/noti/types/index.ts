import { IAuthor } from "@/types/common";
import { EntityType, NotificationType } from "./enum";

export interface INotification {
  notificationId: string;
  recipientId: string;
  type: NotificationType;
  targetId: string; // entityId từ BE
  targetType: EntityType; // "post" | "comment"
  content: string;
  is_read: boolean;
  createdAt: string;
  sender?: {
    userId: string;
    name: string;
    avatar?: string;
  };
  targetSlug?: string;
}

// Params khi gọi API
export interface IGetNotificationsParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
  targetId?: string;
}

// Response từ API (Khớp với Controller của bạn)
export interface IGetNotificationsResponse {
  notifications: INotification[];
  unreadCount: number;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
