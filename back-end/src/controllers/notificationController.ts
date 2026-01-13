import { Response } from "express";
import Notification from "../models/Notification";
import * as notifyService from "../services/notifications/notificationService";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../types/express";
import { buildNotificationAggregationPipeline } from "../services/notifications/notificationPipeline";
import { Types } from "mongoose";

// 1. GET /api/notifications
// 1. Lấy danh sách (Dùng Pipeline để làm phẳng ID)
export const getNotifications = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const filter = { recipientId: new Types.ObjectId(req.userId) };

    const notifications = await Notification.aggregate(
      buildNotificationAggregationPipeline(filter, { includeSender: true })
    );

    const unreadCount = await Notification.countDocuments({
      recipientId: req.userId,
      is_read: false,
    });

    res.json({ notifications, unreadCount });
  }
);

// 2. PATCH /api/notifications/:id/read
// 2. Đánh dấu đã đọc (Dùng findOneAndUpdate trực tiếp vì đơn giản)
export const markAsRead = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.userId },
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Marked as read", notificationId: notification._id });
  }
);

// 3. PATCH /api/notifications/read-all
// 3. Đánh dấu tất cả (Gọi Service)
export const markAllAsRead = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await notifyService.markAllAsReadService(req.userId);
    res.json({ message: "All notifications marked as read" });
  }
);

// 4. DELETE /api/notifications/:id
// 4. Xóa thông báo (Gọi Service và Validation)
export const deleteNotification = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "ID is required" });

    const result = await notifyService.deleteNotificationService(
      id,
      req.userId
    );

    if (!result) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  }
);
