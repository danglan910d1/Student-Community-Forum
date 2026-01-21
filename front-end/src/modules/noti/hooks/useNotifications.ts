// src/modules/notifications/hooks/useNotifications.ts

import { useInfiniteQuery } from "@tanstack/react-query";
import { notificationService } from "../services/notiServices";

export const useNotifications = (limit: number = 10) => {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = 1 }) =>
      notificationService.getNotifications({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    // Giữ dữ liệu cũ trong khi fetch dữ liệu mới để UI không bị giật
    placeholderData: (previousData) => previousData,
  });
};
