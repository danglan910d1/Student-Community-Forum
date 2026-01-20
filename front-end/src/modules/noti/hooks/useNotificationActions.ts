// src/modules/notifications/hooks/useNotificationActions.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notiServices";

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      // Cập nhật cả list và số Badge
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
};

export const useNotificationActions = () => {
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteNoti = useDeleteNotification();

  return {
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
    deleteNoti: deleteNoti.mutate,
    isPending:
      markRead.isPending || markAllRead.isPending || deleteNoti.isPending,
  };
};
