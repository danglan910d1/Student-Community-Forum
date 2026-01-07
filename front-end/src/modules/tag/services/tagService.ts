import { api } from "@/services/api";
import { ITagResponse, IGetTagsParams } from "../types";

export const tagService = {
  // Lấy tags gợi ý: mặc định lấy các tag đã approved
  getTags: async (params?: IGetTagsParams): Promise<ITagResponse> => {
    const { data } = await api.get<ITagResponse>("/tags", { params });
    return data;
  },
};
