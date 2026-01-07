import { api } from "@/services/api";
import {
  ICreatePostBody,
  IGetPostsParams,
  IPost,
  IPostResponse,
} from "@/modules/post/types/index";

export const postService = {
  /**
   * Lấy danh sách bài viết kèm phân trang và lọc
   * Thay vì trả về IPost[], chúng ta trả về toàn bộ IPostResponse
   */
  getPosts: async (params?: IGetPostsParams): Promise<IPostResponse> => {
    // Truyền params vào để backend xử lý lọc (filter) và phân trang
    const { data } = await api.get<IPostResponse>("/posts", { params });

    // Trả về toàn bộ data (bao gồm posts, totalPages, totalItems,...)
    return data;
  },

  // Ví dụ bổ sung lấy chi tiết bài viết
  getPostById: async (postId: string): Promise<IPost> => {
    const { data } = await api.get<IPost>(`/posts/${postId}`);
    return data;
  },

  createPost: async (body: ICreatePostBody): Promise<IPost> => {
    // Backend return về post object sau khi aggregate
    const { data } = await api.post<IPost>("/posts", body);
    return data;
  },
};
