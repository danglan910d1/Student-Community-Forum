// src/modules/posts/services/postService.ts

import { api } from '@/services/api'; // Sử dụng Axios instance đã cấu hình

// Định nghĩa kiểu dữ liệu (Model) của Bài viết
interface IPost {
  // Đảm bảo tên trường khớp với BE MongoDB của bạn
  _id?: string; // Tùy chọn, vì bạn có thể dùng postId
  postId: string; // Sử dụng postId nếu đây là trường duy nhất
  title: string;
  content: string;
  createdAt: string;
}

// Kiểu dữ liệu cho Toàn bộ Response từ BE
interface IPostResponse {
  posts: IPost[]; // Mảng bài viết nằm trong thuộc tính 'posts'
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

// export const postService = {
//   // Hàm gọi API lấy danh sách bài viết
//   getPosts: async (): Promise<IPost[]> => {
//     // Gọi đến URL đầy đủ: http://localhost:5000/api/posts
//     const { data } = await api.get('/posts');
//     return data;
//   },

//   // (Sẽ bổ sung thêm: createPost, getPostById,...)
// };

export const postService = {
  // Thay đổi kiểu trả về là IPost[]
  getPosts: async (): Promise<IPost[]> => {
    // Axios nhận biết response.data là IPostResponse
    const response = await api.get<IPostResponse>('/posts');

    // TRÍCH XUẤT MẢNG: Trả về response.data.posts (tức là mảng bài viết)
    return response.data.posts;
  },
};
