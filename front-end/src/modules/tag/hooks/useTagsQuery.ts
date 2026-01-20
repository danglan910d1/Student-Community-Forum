// modules/tag/hooks/useAdminTagsQuery.ts
import { useQuery } from "@tanstack/react-query";
import { tagService } from "../services/tagService";
import { IGetAdminTagsParams } from "../types";

export function useAdminTagsQuery(params: IGetAdminTagsParams) {
  return useQuery({
    // THAY ĐỔI Ở ĐÂY: Spread params để Object so sánh được các thuộc tính bên trong
    queryKey: ["tags", "admin", { ...params }],

    queryFn: () =>
      tagService.getTags({
        ...params,
        adminView: true,
      }),

    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}
