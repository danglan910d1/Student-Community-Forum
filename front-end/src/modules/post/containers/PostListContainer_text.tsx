// src/modules/posts/containers/PostListContainer.tsx (Đã sửa)
"use client";
import {
  AlertTriangle,
  Bell,
  Check,
  Download,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { usePostsQuery } from "@/modules/post/hooks/usePostsQuery";

export async function PostListContainer({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 1. Giải nén params (Đây là nơi chặn luồng để load full UI)
  await searchParams;
  const { data: posts, isLoading, isError } = usePostsQuery();

  // ... (Code kiểm tra isLoading và isError không đổi)

  if (isError) {
    // Tùy chọn: Log lỗi để debug
    // console.error(error);
    return <div>Đã xảy ra lỗi khi tải bài viết!</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Danh sách Bài viết</h2>

      {/* THÊM KIỂM TRA: posts phải tồn tại và phải là một Array */}
      {posts && Array.isArray(posts) ? (
        posts.map((post) => (
          <div key={post.postId} className="border p-3 my-2 bg-gray-50">
            <h3 className="text-lg font-semibold">{post.title}</h3>
          </div>
        ))
      ) : (
        // Hiển thị thông báo hoặc spinner nếu data không phải là mảng
        <p>Không có bài viết nào được tìm thấy hoặc dữ liệu không hợp lệ.</p>
      )}
    </div>
  );
}
