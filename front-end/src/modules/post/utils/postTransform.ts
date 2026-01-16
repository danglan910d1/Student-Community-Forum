// modules/post/utils/postTransform.ts
import { ICreatePostBody } from "../types";
import { CreatePostInput } from "../schemas/postSchema";

export const transformPostData = (data: CreatePostInput): ICreatePostBody => {
  return {
    title: data.title.trim(),
    content: data.content,
    topicId: data.topicId,
    // Ưu tiên gửi tagId để BE xử lý O(1)
    // Nếu là tag mới (người dùng tự gõ), tagId sẽ không có -> gửi name
    tags: data.tags.map((t) => (t.tagId ? String(t.tagId) : t.name.trim())),
  };
};
