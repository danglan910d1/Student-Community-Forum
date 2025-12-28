import { PipelineStage } from "mongoose";

interface TopicPipelineConfig {
  includeCreator?: boolean;
  includeProjection?: boolean;
}

export const buildTopicAggregationPipeline = (
  filter: any,
  config: TopicPipelineConfig = {}
): PipelineStage[] => {
  const { includeCreator = true, includeProjection = true } = config;

  const pipeline: PipelineStage[] = [
    // 1. Lọc dữ liệu thô
    { $match: filter },
  ];

  // 2. $lookup Creator (Fix N+1)
  if (includeCreator) {
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creatorInfo", // Đổi tên tạm để tránh trùng với field gốc
        },
      },
      {
        // Trải mảng để biến thành object thay vì mảng 1 phần tử
        $set: {
          creatorInfo: { $arrayElemAt: ["$creatorInfo", 0] },
        },
      }
    );
  }

  // 3. Project - Giai đoạn quan trọng nhất để thống nhất cấu trúc
  if (includeProjection) {
    pipeline.push({
      $project: {
        _id: 0,
        topicId: "$_id", // Đổi sang topicId như Tag/Post đã làm
        name: 1,
        slug: 1,
        description: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        // Chỉ trả ra thông tin User cần thiết nếu includeCreator = true
        createdBy: includeCreator
          ? {
              userId: "$creatorInfo._id",
              name: "$creatorInfo.name",
              email: "$creatorInfo.email",
            }
          : "$createdBy",
      },
    });
  }

  return pipeline;
};
