// modules/tag/hooks/useTagStats.ts
import { useQuery } from "@tanstack/react-query";
import { tagService } from "../services/tagService";

export function useTagStats() {
  return useQuery({
    queryKey: ["tags", "admin", "stats-pending"],
    queryFn: async () => {
      const data = await tagService.getTags({
        status: "pending",
        limit: 1,
        adminView: true,
      });
      return { pendingCount: data.pagination.totalItems };
    },
    // Refresh mỗi khi có bất kỳ thay đổi nào liên quan đến tags
    staleTime: 1000 * 60 * 2, // 2 phút
  });
}
