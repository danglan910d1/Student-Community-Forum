import { api } from "@/services/api";
import {
  IAdminApprovePostBody,
  ICreatePostBody,
  IGetPostsRequestParams,
  IPost,
  IPostResponse,
} from "@/modules/post/types/index";

export const postService = {
  /**
   * Lấy danh sách bài viết kèm phân trang và lọc
   * Thay vì trả về IPost[], chúng ta trả về toàn bộ IPostResponse
   */
  getPosts: async (params?: IGetPostsRequestParams): Promise<IPostResponse> => {
    const { data } = await api.get<IPostResponse>("/posts", {
      params: {
        ...params,
        // Ép kiểu về boolean để Backend dễ xử lý
        adminView: params?.adminView === true,
      },
    });
    return data;
  },

  getPostById: async (
    postId: string,
    adminView: boolean = false
  ): Promise<IPost> => {
    // Nếu adminView = true thì gọi vào route admin, ngược lại gọi route public
    const endpoint = adminView ? `/posts/admin/${postId}` : `/posts/${postId}`;

    const { data } = await api.get<IPost>(endpoint);
    return data;
  },

  createPost: async (body: ICreatePostBody): Promise<IPost> => {
    // Backend return về post object sau khi aggregate
    const { data } = await api.post<IPost>("/posts", body);
    return data;
  },

  updatePost: async (id: string, body: ICreatePostBody): Promise<IPost> => {
    const { data } = await api.put<IPost>(`/posts/${id}`, body);
    return data;
  },

  deletePost: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/posts/${id}`);
    return data;
  },
  adminApprovePost: async (
    id: string,
    body: IAdminApprovePostBody
  ): Promise<IPost> => {
    const { data } = await api.post<IPost>(`/posts/admin/approve/${id}`, body);
    return data;
  },

  toggleSticky: async (id: string, isSticky: boolean): Promise<IPost> => {
    const { data } = await api.put<IPost>(`/posts/admin/sticky/${id}`, {
      is_sticky: isSticky,
    });
    return data;
  },

  restorePost: async (
    id: string
  ): Promise<{ message: string; postId: string }> => {
    const { data } = await api.put(`/posts/admin/restore/${id}`);
    return data;
  },
};
