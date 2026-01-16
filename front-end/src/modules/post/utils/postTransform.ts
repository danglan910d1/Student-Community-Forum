// modules/post/utils/postTransform.ts
import { ICreatePostBody } from "../types";
import { CreatePostInput } from "../schemas/postSchema";

// modules/post/utils/postTransform.ts
export const transformPostData = (data: CreatePostInput): ICreatePostBody => {
  return {
    title: data.title,
    content: data.content,
    topicId: data.topicId,
    tags: data.tags.map((t) => t.name.trim()),
  };
};
