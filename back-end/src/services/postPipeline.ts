import { PipelineStage } from "mongoose";

// Định nghĩa cấu hình cho Pipeline
interface PostPipelineConfig {
  includeUser?: boolean;
  includeTopic?: boolean;
  includeTags?: boolean;
  includeProjection?: boolean; // Bao gồm cả Stage $project cuối cùng
}

/**
 * Xây dựng các Aggregation Pipeline Stages cho Post Model một cách linh hoạt.
 *
 * Hàm này giúp tái sử dụng logic $lookup cho nhiều API khác nhau (danh sách, chi tiết).
 *
 * @param filter - Stage $match ban đầu (dùng filter được xây dựng từ buildPostFilter)
 * @param config - Cấu hình để bật/tắt các $lookup và $project
 * @returns Mảng các PipelineStage đã được cấu hình.
 */
export const buildPostAggregationPipeline = (
  filter: any,
  config: PostPipelineConfig = {}
): PipelineStage[] => {
  // Giá trị mặc định nếu không truyền config
  const {
    includeUser = true,
    includeTopic = true,
    includeTags = true,
    includeProjection = true,
  } = config;

  const pipeline: PipelineStage[] = [
    // Stage 1: Lọc dữ liệu thô (BẮT BUỘC)
    { $match: filter },
  ];

  // Stage 2: $lookup User
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

  // Stage 3: $lookup Topic
  if (includeTopic) {
    pipeline.push({
      $lookup: {
        from: "topics",
        localField: "topicId",
        foreignField: "_id",
        as: "topic",
      },
    });
  }

  // Stage 4: $lookup Tags
  if (includeTags) {
    pipeline.push({
      $lookup: {
        from: "tags",
        localField: "tags",
        foreignField: "_id",
        as: "tagsData",
      },
    });
  }

  // Stage 5: Project/Format kết quả cuối cùng
  if (includeProjection) {
    pipeline.push({
      $project: {
        _id: 0,
        postId: "$_id",
        title: 1,
        slug: 1,
        content: 1,
        views_count: 1,
        likes_count: 1,
        comments_count: 1,
        status: 1,
        is_sticky: 1,
        createdAt: 1,
        // Định dạng các trường lookup
        user: includeUser ? { $arrayElemAt: ["$user", 0] } : "$userId",
        topic: includeTopic ? { $arrayElemAt: ["$topic", 0] } : "$topicId",
        tags: includeTags ? "$tagsData" : "$tags", // Trả về tagsData hoặc mảng ObjectId gốc
      },
    });
  }

  return pipeline;
};
