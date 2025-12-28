import { PipelineStage } from "mongoose";

interface TagPipelineConfig {
  includeTopic?: boolean;
  includeCreator?: boolean;
  includeProjection?: boolean;
}

/**
 * Xây dựng các Aggregation Pipeline Stages cho Tag Model.
 * Cập nhật để bỏ _id và đồng nhất tagId theo Model Transform.
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
    // Stage 1: Lọc dữ liệu thô
    { $match: filter },
  ];

  // Stage 2: $lookup Topic
  if (includeTopic) {
    pipeline.push({
      $lookup: {
        from: "topics",
        localField: "topicId",
        foreignField: "_id",
        as: "topicData", // Đổi tên tạm để tránh ghi đè
      },
    });
  }

  // Stage 3: $lookup Creator
  if (includeCreator) {
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "creatorData",
      },
    });
  }

  // Stage 4: Project/Format kết quả cuối cùng
  if (includeProjection) {
    pipeline.push({
      $project: {
        _id: 0, // BỎ _id Ở ĐÂY (Vì Model của bạn đã bỏ _id)
        tagId: "$_id", // LẤY _id GÁN VÀO tagId
        name: 1,
        slug: 1,
        status: 1,
        // Xử lý topicId: Nếu lookup thành công thì lấy object đầu tiên,
        // nhưng bên trong object đó cũng phải đổi _id thành topicId cho đồng bộ
        topic: includeTopic
          ? {
              $let: {
                vars: { top: { $arrayElemAt: ["$topicData", 0] } },
                in: {
                  topicId: "$$top._id",
                  name: "$$top.name",
                  slug: "$$top.slug",
                },
              },
            }
          : "$topicId",

        // Xử lý createdBy
        createdBy: includeCreator
          ? {
              $let: {
                vars: { user: { $arrayElemAt: ["$creatorData", 0] } },
                in: {
                  userId: "$$user._id",
                  name: "$$user.name",
                  avatar: "$$user.avatar",
                },
              },
            }
          : "$createdBy",

        createdAt: 1,
        updatedAt: 1,
      },
    });
  }

  return pipeline;
};
