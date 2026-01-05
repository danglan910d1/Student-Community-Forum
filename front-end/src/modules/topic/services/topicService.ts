import { api } from "@/services/api";
import { ITopic, ITopicResponse } from "../types";

export const topicService = {
  getTopics: async (): Promise<ITopic[]> => {
    // Gọi API lấy object chứa mảng topics
    const response = await api.get<ITopicResponse>("/topics");

    // Trả về mảng topics bên trong
    return response.data.topics || [];
  },
};
