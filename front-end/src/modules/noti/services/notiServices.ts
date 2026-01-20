// src/modules/notifications/services/notificationService.ts

import { api } from "@/services/api";
import {
  IGetNotificationsParams,
  IGetNotificationsResponse,
  INotification,
} from "../types";

export const notificationService = {
  /**
   * Lấy danh sách thông báo có phân trang
   * GET /api/notifications?page=...&limit=...&is_read=...
   */
  getNotifications: async (
    params: IGetNotificationsParams,
  ): Promise<IGetNotificationsResponse> => {
    const { data } = await api.get<IGetNotificationsResponse>(
      "/notifications",
      {
        params,
      },
    );
    return data;
  },

  /**
   * Đánh dấu một thông báo là đã đọc
   * PATCH /api/notifications/:id/read
   */
  markAsRead: async (
    notificationId: string,
  ): Promise<{ notificationId: string }> => {
    const { data } = await api.patch<{ notificationId: string }>(
      `/notifications/${notificationId}/read`,
    );
    return data;
  },

  /**
   * Đánh dấu tất cả thông báo của người dùng hiện tại là đã đọc
   * PATCH /api/notifications/read-all
   */
  markAllAsRead: async (): Promise<{ message: string }> => {
    const { data } = await api.patch<{ message: string }>(
      "/notifications/read-all",
    );
    return data;
  },

  /**
   * Xóa một thông báo
   * DELETE /api/notifications/:id
   */
  deleteNotification: async (
    notificationId: string,
  ): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>(
      `/notifications/${notificationId}`,
    );
    return data;
  },
};
