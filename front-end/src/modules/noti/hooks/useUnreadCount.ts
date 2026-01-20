// src/modules/notifications/hooks/useUnreadCount.ts
import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../services/notiServices";

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.getNotifications({ page: 1, limit: 1 }),
    select: (data) => data.unreadCount,
    // CẬP NHẬT: Cứ mỗi 20 giây sẽ tự check thông báo mới ngầm dưới background
    refetchInterval: 20000,
    refetchOnWindowFocus: true, // Khi user quay lại tab sẽ check ngay
  });
};
