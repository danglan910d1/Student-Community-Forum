import { api } from "@/services/api";
import {
  LikeTargetType,
  IToggleLikeResponse,
  ILikeStatusResponse,
} from "../types";

export const likeService = {
  /**
   * Toggle Like (Post / Comment)
   */
  toggleLike: async (
    targetType: LikeTargetType,
    targetId: string
  ): Promise<IToggleLikeResponse> => {
    const { data } = await api.post<IToggleLikeResponse>(
      `/likes/${targetType}/${targetId}`
    );
    return data;
  },

  /**
   * Lấy trạng thái like (để hiển thị icon)
   */
  getLikeStatus: async (
    targetType: LikeTargetType,
    targetId: string
  ): Promise<ILikeStatusResponse> => {
    const { data } = await api.get<ILikeStatusResponse>("/likes", {
      params: { targetType, targetId },
    });
    return data;
  },
};
