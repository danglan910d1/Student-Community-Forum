// Định nghĩa các loại Status có thể áp dụng cho Post
export type PostStatus = "pending" | "approved" | "rejected";

// 1. Dùng cho Params (Lấy chi tiết, cập nhật, xóa)
export interface PostParams {
  id: string;
}

// 2. Dùng cho POST /posts (Tạo bài viết)
export interface CreatePostBody {
  topicId: string;
  tags?: string[]; // Mảng ID Tags (string)
  title: string;
  content: string;
}

// 3. Dùng cho GET /posts (Danh sách, lọc, phân trang)
export interface GetPostsQuery {
  topicId?: string;
  tagId?: string;
  page?: string;
  limit?: string;
  status?: PostStatus; // Chỉ Admin mới có thể lọc theo status khác 'approved'
  search?: string; // Tìm kiếm theo tiêu đề/nội dung
}

// 4. Dùng cho PUT /posts/:id (Cập nhật)
export interface UpdatePostBody {
  topicId?: string;
  tags?: string[];
  title?: string;
  content?: string;
  status?: PostStatus; // Dành cho Admin
  is_sticky?: boolean; // Dành cho Admin
}
