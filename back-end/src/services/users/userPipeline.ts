import { PipelineStage } from "mongoose";

export const buildUserAggregationPipeline = (
  filter: any,
  options: {
    includeStats?: boolean;
    isAdminView?: boolean;
  } = {}
): PipelineStage[] => {
  const pipeline: PipelineStage[] = [{ $match: filter }];

  if (options.includeStats) {
    pipeline.push(
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "rawPosts",
          pipeline: [{ $match: { is_deleted: { $ne: true } } }],
        },
      },
      {
        $addFields: {
          postStats: {
            published: {
              $size: {
                $filter: {
                  input: "$rawPosts",
                  as: "p",
                  cond: { $eq: ["$$p.status", "approved"] },
                },
              },
            },
            pending: {
              $size: {
                $filter: {
                  input: "$rawPosts",
                  as: "p",
                  cond: { $eq: ["$$p.status", "pending"] },
                },
              },
            },
          },
        },
      }
    );
  }

  pipeline.push({
    $project: {
      userId: "$_id",
      _id: 0,
      name: 1,
      avatar: 1,
      role: 1,
      createdAt: 1,
      updatedAt: 1, // Đưa ra ngoài: AI CŨNG THẤY ĐƯỢC

      // Xử lý postCount linh hoạt
      ...(options.includeStats
        ? {
            postCount: {
              $cond: {
                if: options.isAdminView,
                then: {
                  total: {
                    $add: ["$postStats.published", "$postStats.pending"],
                  },
                  published: "$postStats.published",
                  pending: "$postStats.pending",
                },
                else: {
                  published: "$postStats.published", // Vẫn là Object nhưng chỉ có trường published
                },
              },
            },
          }
        : {}),

      // Dữ liệu nhạy cảm chỉ Admin thấy
      ...(options.isAdminView
        ? {
            email: 1,
            status: 1,
          }
        : {}),
    },
  });

  return pipeline;
};
