// src/services/commentService.ts

import { api } from "@/services/api";
import { IComment, ICommentResponse } from "../types";

export const commentService = {
  // GET /api/comments?postId=...
  getComments: async (
    postId: string,
    page = 1,
    limit = 10,
    parentId: string | null = null // Thêm cái này
  ): Promise<ICommentResponse> => {
    const { data } = await api.get<ICommentResponse>("/comments", {
      params: { postId, page, limit, parentId }, // Gửi lên server
    });
    return data;
  },

  // POST /api/comments
  createComment: async (payload: {
    postId: string;
    content: string;
    parentId?: string | null;
  }) => {
    const { data } = await api.post<IComment>("/comments", payload);
    return data;
  },

  updateComment: async (commentId: string, content: string) => {
    // API: PUT /api/comments/:commentId
    const { data } = await api.put<IComment>(`/comments/${commentId}`, {
      content,
    });
    return data;
  },

  // DELETE /api/comments/:commentId
  deleteComment: async (commentId: string) => {
    const { data } = await api.delete(`/comments/${commentId}`);
    return data;
  },
};
