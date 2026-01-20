import { useQuery } from "@tanstack/react-query";
import { tagService } from "../services/tagService";

export function useTagDetail(id: string) {
  return useQuery({
    queryKey: ["tags", "detail", id],
    queryFn: () => tagService.getTagById(id),
    enabled: !!id, // Chỉ chạy khi có ID
    staleTime: 1000 * 60 * 5, // Dữ liệu chi tiết giữ 5 phút
  });
}
