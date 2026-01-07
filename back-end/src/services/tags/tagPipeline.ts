import { PipelineStage } from "mongoose";

interface TagPipelineConfig {
  includeTopic?: boolean;
  includeUser?: boolean;
  includeProjection?: boolean;
  isAdminView?: boolean;
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
    includeUser = true,
    includeProjection = true,
    isAdminView = false,
  } = config;

  const pipeline: PipelineStage[] = [{ $match: filter }];

  if (includeTopic) {
    pipeline.push({
      $lookup: {
        from: "topics",
        let: { tId: "$topicId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$tId"] },
                  { $ne: ["$is_deleted", true] },
                ],
              },
            },
          },
        ],
        as: "topicData",
      },
    });
  }

  if (includeUser) {
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "userData",
      },
    });
  }

  pipeline.push({
    $lookup: {
      from: "posts",
      localField: "_id",
      foreignField: "tags",
      as: "postsUsingThisTag",
    },
  });

  // Thêm field postCount
  pipeline.push({
    $addFields: {
      postCount: { $size: "$postsUsingThisTag" },
    },
  });

  if (includeProjection) {
    pipeline.push({
      $project: {
        _id: 0,
        tagId: "$_id",
        name: 1,
        slug: 1,
        createdAt: 1,
        updatedAt: 1,
        postCount: 1,
        status: { $cond: [isAdminView, "$status", "$$REMOVE"] },

        topic: includeTopic
          ? {
              $let: {
                vars: { top: { $arrayElemAt: ["$topicData", 0] } },
                in: {
                  $cond: [
                    { $ifNull: ["$$top", false] },
                    {
                      topicId: "$$top._id",
                      name: "$$top.name",
                      slug: "$$top.slug",
                    },
                    null,
                  ],
                },
              },
            }
          : "$topicId",

        user: includeUser
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
                    },
                    null,
                  ],
                },
              },
            }
          : "$createdBy",
      },
    });
  }

  return pipeline;
};
