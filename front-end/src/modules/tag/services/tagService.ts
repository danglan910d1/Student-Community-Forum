import { api } from "@/services/api";
import {
  ITagResponse,
  IGetTagsRequestParams,
  ITag,
  ICreateTagBody,
  IBulkUpdateTagBody,
} from "../types";

export const tagService = {
  // Lấy tags gợi ý: mặc định lấy các tag đã approved
  getTags: async (params?: IGetTagsRequestParams): Promise<ITagResponse> => {
    // Nếu adminView = true, dùng route /tags/admin, ngược lại dùng /tags
    const endpoint = params?.adminView ? "/tags/admin" : "/tags";

    const { data } = await api.get<ITagResponse>(endpoint, {
      params: {
        ...params,
        // Backend mới nhận diện qua Route nên adminView ở params có thể giữ hoặc bỏ
        // Nhưng tốt nhất là gửi đi để đồng bộ logic isAdmin trong Controller
        adminView: params?.adminView === true,
      },
    });
    return data;
  },
  /**
   * Lấy chi tiết một tag (Dùng cho trang edit tag của Admin)
   */
  getTagById: async (id: string, adminView: boolean = false): Promise<ITag> => {
    const endpoint = adminView ? `/tags/admin/${id}` : `/tags/${id}`;
    const { data } = await api.get<ITag>(endpoint);
    return data;
  },

  /**
   * Admin tạo Tag chính thống
   */
  createTag: async (body: ICreateTagBody): Promise<ITag> => {
    const { data } = await api.post<ITag>("/tags/admin", body);
    return data;
  },

  /**
   * Admin cập nhật Tag
   */
  updateTag: async (
    id: string,
    body: Partial<ICreateTagBody>
  ): Promise<ITag> => {
    const { data } = await api.put<ITag>(`/tags/admin/${id}`, body);
    return data;
  },

  /**
   * Duyệt/Từ chối hàng loạt Tags (Chức năng bulk của Admin)
   */
  bulkUpdateTags: async (
    body: IBulkUpdateTagBody
  ): Promise<{ message: string }> => {
    const { data } = await api.patch("/tags/admin/bulk", body);
    return data;
  },

  /**
   * Xóa mềm Tag
   */
  deleteTag: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/tags/admin/${id}`);
    return data;
  },

  /**
   * Khôi phục Tag
   */
  restoreTag: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.put(`/tags/admin/restore/${id}`);
    return data;
  },
};
