import { api } from "@/services/api";

// 1. Định nghĩa kiểu dữ liệu cho MỘT Bài viết
interface IPost {
  postId: string;
  title: string;
  content: string;
  createdAt: string;
  // Thêm các trường khác cần thiết (ví dụ: user, topic, tags)
}

// 2. Định nghĩa kiểu dữ liệu cho TOÀN BỘ PHẢN HỒI từ Backend (Object chứa Array)
interface IPostResponse {
  posts: IPost[]; // Mảng bài viết nằm trong thuộc tính 'posts'
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

export const postService = {
  // Hàm gọi API lấy danh sách bài viết
  // Kiểu trả về vẫn là Promise<IPost[]> (một mảng bài viết)
  getPosts: async (): Promise<IPost[]> => {
    // Sử dụng kiểu IPostResponse để Axios hiểu cấu trúc dữ liệu nhận về
    const { data } = await api.get<IPostResponse>("/posts");

    // 3. TRÍCH XUẤT ARRAY:
    // Trả về thuộc tính 'posts' bên trong Object response
    if (data && Array.isArray(data.posts)) {
      return data.posts;
    }

    // Xử lý trường hợp không có dữ liệu
    return [];
  },

  // (Sẽ bổ sung thêm: createPost, getPostById,...)
};
