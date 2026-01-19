import { api } from "@/services/api";
import { IGetAdminTopicsParams, ITopic, ITopicResponse } from "../types";

export const topicService = {
  getTopics: async (): Promise<ITopic[]> => {
    // Gọi API lấy object chứa mảng topics
    const response = await api.get<ITopicResponse>("/topics");

    // Trả về mảng topics bên trong
    return response.data.topics || [];
  },
  getAdminTopics: async (
    params?: IGetAdminTopicsParams,
  ): Promise<ITopicResponse> => {
    const { data } = await api.get<ITopicResponse>("/topics/admin", { params });
    return data;
  },

  getTopicById: async (id: string): Promise<ITopic> => {
    const { data } = await api.get<ITopic>(`/topics/admin/${id}`);
    return data;
  },

  // POST /api/topics/admin
  createTopic: async (body: Partial<ITopic>): Promise<ITopic> => {
    const { data } = await api.post<ITopic>("/topics/admin", body);
    return data;
  },

  // PUT /api/topics/admin/:id
  updateTopic: async (id: string, body: Partial<ITopic>): Promise<ITopic> => {
    const { data } = await api.put<ITopic>(`/topics/admin/${id}`, body);
    return data;
  },

  // DELETE /api/topics/admin/:id
  deleteTopic: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/topics/admin/${id}`);
    return data;
  },

  // PUT /api/topics/admin/restore/:id
  restoreTopic: async (
    id: string,
  ): Promise<{ message: string; topicId: string }> => {
    const { data } = await api.put(`/topics/admin/restore/${id}`);
    return data;
  },
};
