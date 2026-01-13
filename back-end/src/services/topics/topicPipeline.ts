import { PipelineStage } from "mongoose";

interface TopicPipelineConfig {
  includeUser?: boolean;
  includeProjection?: boolean;
  isAdminView?: boolean;
}

export const buildTopicAggregationPipeline = (
  filter: any,
  config: TopicPipelineConfig = {}
): PipelineStage[] => {
  const {
    includeUser = true,
    includeProjection = true,
    isAdminView = false,
  } = config;

  const pipeline: PipelineStage[] = [{ $match: filter }];

  if (includeUser && isAdminView) {
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [{ $match: { is_deleted: { $ne: true } } }],
        as: "userData",
      },
    });
  }

  if (includeProjection) {
    pipeline.push({
      $project: {
        _id: 0,
        topicId: "$_id",
        name: 1,
        slug: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        status: { $cond: [isAdminView, "$status", "$$REMOVE"] },

        // Nếu là AdminView: Trả về object chi tiết
        // Nếu là Public: Biến mất hoàn toàn (không lộ ID Admin)
        user:
          isAdminView && includeUser
            ? {
                $let: {
                  vars: { user: { $arrayElemAt: ["$userData", 0] } },
                  in: {
                    $cond: [
                      { $ifNull: ["$$user", false] },
                      {
                        userId: "$$user._id",
                        name: "$$user.name",
                        avatar: "$$user.avatar",
                        email: "$$user.email", // Admin thấy luôn email
                      },
                      null,
                    ],
                  },
                },
              }
            : "$$REMOVE", // Public thì không thấy field 'user' này luôn
      },
    });
  }

  return pipeline;
};
