import { PipelineStage, Types } from "mongoose";

interface PostPipelineConfig {
  includeUser?: boolean;
  includeTopic?: boolean;
  includeTags?: boolean;
  includeProjection?: boolean;
  isAdminView?: boolean;
}

export const buildPostAggregationPipeline = (
  filter: any,
  config: PostPipelineConfig = {}
): PipelineStage[] => {
  const {
    includeUser = true,
    includeTopic = true,
    includeTags = true,
    includeProjection = true,
    isAdminView = false,
  } = config;

  const pipeline: PipelineStage[] = [{ $match: filter }];

  // 1. Lookup User
  if (includeUser) {
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [{ $match: { is_deleted: { $ne: true } } }],
          as: "userData",
        },
      },
      { $unwind: "$userData" }
    );
  }

  // 2. Lookup Topic
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

  // 3. Lookup Tags (Gộp cả Approved và Pending)
  if (includeTags) {
    pipeline.push({
      $lookup: {
        from: "tags",
        let: {
          tIds: { $ifNull: ["$tags", []] },
          pIds: { $ifNull: ["$pending_tags", []] },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $or: [
                      { $in: ["$_id", "$$tIds"] },
                      { $in: ["$_id", "$$pIds"] },
                    ],
                  },
                  { $ne: ["$is_deleted", true] },
                ],
              },
            },
          },
        ],
        as: "allTagsFetched",
      },
    });
  }

  // 4. Projection - Giai đoạn xử lý dữ liệu cuối cùng
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
        is_sticky: 1,
        is_resolved: 1,
        createdAt: 1,
        updatedAt: 1,
        status: { $cond: [isAdminView, "$status", "$status"] },

        // User Mapping
        user: includeUser
          ? {
              userId: "$userData._id",
              name: "$userData.name",
              avatar: "$userData.avatar",
              role: "$userData.role",
              email: { $cond: [isAdminView, "$userData.email", "$$REMOVE"] },
            }
          : "$userId",

        // Topic Mapping
        topic: includeTopic
          ? {
              $let: {
                vars: { t: { $arrayElemAt: ["$topicData", 0] } },
                in: {
                  $cond: [
                    { $ifNull: ["$$t", false] },
                    { topicId: "$$t._id", name: "$$t.name", slug: "$$t.slug" },
                    null,
                  ],
                },
              },
            }
          : "$topicId",

        // Tags Approved Mapping
        tags: includeTags
          ? {
              $filter: {
                input: {
                  $map: {
                    input: "$allTagsFetched",
                    as: "tag",
                    in: {
                      tagId: "$$tag._id",
                      name: "$$tag.name",
                      slug: "$$tag.slug",
                      status: "$$tag.status",
                    },
                  },
                },
                as: "fTag",
                cond: { $eq: ["$$fTag.status", "approved"] },
              },
            }
          : "$tags",

        // Pending Tags Mapping (Chỉ Admin mới thấy)
        pending_tags: includeTags
          ? {
              $filter: {
                input: {
                  $map: {
                    input: "$allTagsFetched",
                    as: "tag",
                    in: {
                      tagId: "$$tag._id",
                      name: "$$tag.name",
                      slug: "$$tag.slug",
                      status: "$$tag.status",
                    },
                  },
                },
                as: "pTag",
                // Lọc những tag có status KHÁC approved (tức là pending hoặc rejected)
                cond: { $ne: ["$$pTag.status", "approved"] },
              },
            }
          : "$pending_tags",
      },
    });
  }

  return pipeline;
};
