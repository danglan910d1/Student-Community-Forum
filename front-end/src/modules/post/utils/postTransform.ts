// modules/post/utils/postTransform.ts
import { ICreatePostBody } from "../types";
import { CreatePostInput } from "../schemas/postSchema";

export const transformPostData = (data: CreatePostInput): ICreatePostBody => {
  return {
    title: data.title,
    content: data.content,
    topicId: data.topicId,
    // TRỌNG TÂM: Biến [ {name: 'React', ...} ] thành [ 'React' ]
    tags: data.tags.map((t) => t.name),
  };
};
