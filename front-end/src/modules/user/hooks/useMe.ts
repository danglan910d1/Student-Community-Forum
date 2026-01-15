// src/modules/user/hooks/useMe.ts
import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { useAuthStore } from "@/stores/useAuthStore";

export function useMe() {
  const { isAuthenticated, updateProfile } = useAuthStore();

  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const data = await userService.getMe();

      // FIX LỖI: Chuyển null thành undefined
      updateProfile({
        name: data.name,
        avatar: data.avatar ?? undefined, // Nếu là null thì lấy undefined
      });

      return data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}
