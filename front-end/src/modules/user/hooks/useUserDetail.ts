// src/modules/user/hooks/useUserDetail.ts
import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";

export function useUserDetail(userId: string) {
  return useQuery({
    queryKey: ["user", "detail", userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // Cache 2 phút cho profile người khác
  });
}
