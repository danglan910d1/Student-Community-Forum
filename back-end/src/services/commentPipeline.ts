import { PipelineStage } from "mongoose";

interface CommentPipelineConfig {
  includeUser?: boolean; // Người bình luận
  includePost?: boolean; // Bài viết liên quan
  includeParent?: boolean; // Bình luận cha
  includeProjection?: boolean;
}

/**
 * Xây dựng Aggregation Pipeline cho Comment Model (FIX N+1 Query).
 */
export const buildCommentAggregationPipeline = (
  filter: any,
  config: CommentPipelineConfig = {}
): PipelineStage[] => {
  const {
    includeUser = true,
    includePost = false,
    includeParent = false,
    includeProjection = true,
  } = config;

  const pipeline: PipelineStage[] = [{ $match: filter }];

  // $lookup User
  if (includeUser) {
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    });
  }

  // $lookup Post
  if (includePost) {
    pipeline.push({
      $lookup: {
        from: "posts",
        localField: "postId",
        foreignField: "_id",
        as: "post",
      },
    });
  }

  // $lookup Parent
  if (includeParent) {
    pipeline.push({
      $lookup: {
        from: "comments",
        localField: "parentId",
        foreignField: "_id",
        as: "parent",
      },
    });
  }

  // Projection
  if (includeProjection) {
    pipeline.push({
      $project: {
        _id: 0,
        commentId: "$_id",
        content: 1,
        likes_count: 1,
        replies_count: 1,
        is_deleted: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,

        // Định dạng các trường lookup
        userId: includeUser ? { $arrayElemAt: ["$user", 0] } : "$userId",
        postId: includePost ? { $arrayElemAt: ["$post", 0] } : "$postId",
        parentId: includeParent
          ? { $arrayElemAt: ["$parent", 0] }
          : "$parentId",
      },
    });
  }

  return pipeline;
};
