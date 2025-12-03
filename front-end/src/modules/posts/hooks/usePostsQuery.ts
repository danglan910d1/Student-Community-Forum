// src/modules/posts/hooks/usePostsQuery.ts

import { useQuery } from '@tanstack/react-query';
import { postService } from '../services/postService'; // Import service vừa tạo

export const usePostsQuery = () => {
  return useQuery({
    // Key cache (quan trọng, dùng để tái fetch và lưu cache)
    queryKey: ['posts'],
    // Hàm thực hiện fetch
    queryFn: postService.getPosts,
    // Tùy chọn: Thời gian dữ liệu được coi là "tươi"
    staleTime: 1000 * 30, // 30 giây
  });
};
