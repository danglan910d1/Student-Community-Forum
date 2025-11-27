import { PipelineStage } from "mongoose";

// Định nghĩa cấu hình cho Pipeline
interface TopicPipelineConfig {
  includeCreator?: boolean; // Tương đương với createdBy
  includeProjection?: boolean;
}

/**
 * Xây dựng các Aggregation Pipeline Stages cho Topic Model.
 * FIX N+1 Query bằng cách sử dụng $lookup cho createdBy.
 *
 * @param filter - Stage $match ban đầu
 * @param config - Cấu hình để bật/tắt $lookup và $project
 * @returns Mảng các PipelineStage đã được cấu hình.
 */
export const buildTopicAggregationPipeline = (
  filter: any,
  config: TopicPipelineConfig = {}
): PipelineStage[] => {
  const { includeCreator = true, includeProjection = true } = config;

  const pipeline: PipelineStage[] = [
    // Stage 1: Lọc dữ liệu thô (BẮT BUỘC)
    { $match: filter },
  ];

  // Stage 2: $lookup Creator (Thay thế populate)
  if (includeCreator) {
    pipeline.push({
      $lookup: {
        from: "users", // Giả định collection tên là users
        localField: "createdBy",
        foreignField: "_id",
        as: "creator",
      },
    });
  }

  // Stage 3: Project/Format kết quả cuối cùng (Đồng nhất ID)
  if (includeProjection) {
    pipeline.push({
      $project: {
        _id: 0,
        topicId: "$_id", // Đồng nhất ID
        name: 1,
        slug: 1,
        description: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        // Lấy creator đầu tiên
        createdBy: includeCreator
          ? { $arrayElemAt: ["$creator", 0] }
          : "$createdBy",
      },
    });
  }

  return pipeline;
};
