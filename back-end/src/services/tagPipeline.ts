import { PipelineStage } from "mongoose";

interface TagPipelineConfig {
  includeTopic?: boolean;
  includeCreator?: boolean;
  includeProjection?: boolean;
}

/**
 * Xây dựng các Aggregation Pipeline Stages cho Tag Model.
 * FIX N+1 Query bằng cách sử dụng $lookup.
 */
export const buildTagAggregationPipeline = (
  filter: any,
  config: TagPipelineConfig = {}
): PipelineStage[] => {
  const {
    includeTopic = true,
    includeCreator = true,
    includeProjection = true,
  } = config;

  const pipeline: PipelineStage[] = [
    // Stage 1: Lọc dữ liệu thô (BẮT BUỘC)
    { $match: filter },
  ];

  // Stage 2: $lookup Topic
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

  // Stage 3: $lookup Creator
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

  // Stage 4: Project/Format kết quả cuối cùng (Đồng nhất ID)
  if (includeProjection) {
    pipeline.push({
      $project: {
        _id: 0,
        tagId: "$_id", // Đồng nhất ID
        name: 1,
        slug: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        // Định dạng các trường lookup
        topicId: includeTopic ? { $arrayElemAt: ["$topic", 0] } : "$topicId",
        createdBy: includeCreator
          ? { $arrayElemAt: ["$creator", 0] }
          : "$createdBy",
      },
    });
  }

  return pipeline;
};
