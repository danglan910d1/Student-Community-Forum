import { PipelineStage, Types } from "mongoose";

interface PostPipelineConfig {
  includeUser?: boolean;
  includeTopic?: boolean;
  includeTags?: boolean;
  includeProjection?: boolean;
}

/**
 * Xây dựng các Aggregation Pipeline Stages cho Post Model một cách linh hoạt.
 *
 * Hàm này giúp tái sử dụng logic $lookup cho nhiều API khác nhau (danh sách, chi tiết).
 *
 * @param filter - Stage $match ban đầu (dùng filter được xây dựng từ buildPostFilter)
 * @param config - Cấu hình để bật/tắt các $lookup và $project
 * @param isAdmin - Boolean xác định quyền hạn của người gọi
 * @param callerId - ID của người đang thực hiện request (để tính toán isOwner)
 * @returns Mảng các PipelineStage đã được cấu hình.
 */
export const buildPostAggregationPipeline = (
  filter: any,
  config: PostPipelineConfig = {},
  isAdmin: boolean = false,
  callerId?: string
): PipelineStage[] => {
  const {
    includeUser = true,
    includeTopic = true,
    includeTags = true,
    includeProjection = true,
  } = config;

  const pipeline: PipelineStage[] = [{ $match: filter }];

  if (includeUser) {
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userData",
      },
    });
  }

  if (includeTopic) {
    pipeline.push({
      $lookup: {
        from: "topics",
        localField: "topicId",
        foreignField: "_id",
        as: "topicData",
      },
    });
  }

  if (includeTags) {
    pipeline.push({
      $lookup: {
        from: "tags",
        localField: "tags",
        foreignField: "_id",
        as: "tagsList",
      },
    });
  }

  if (callerId) {
    pipeline.push({
      $addFields: {
        isOwner: { $eq: ["$userId", new Types.ObjectId(callerId)] },
      },
    });
  }

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
        status: { $cond: [isAdmin, "$status", "$$REMOVE"] },

        // Format Author (khớp với FE MockData)
        author: {
          $let: {
            vars: { user: { $arrayElemAt: ["$userData", 0] } },
            in: {
              name: { $ifNull: ["$$user.name", "Anonymous"] },
              avatar: "$$user.avatar",
              role: "$$user.role",
              // Chỉ hiện email/status nếu là admin hoặc chủ bài viết
              email: {
                $cond: [
                  { $or: [isAdmin, "$isOwner"] },
                  "$$user.email",
                  "$$REMOVE",
                ],
              },
              status: {
                $cond: [
                  { $or: [isAdmin, "$isOwner"] },
                  "$$user.status",
                  "$$REMOVE",
                ],
              },
            },
          },
        },

        topic: includeTopic
          ? {
              $let: {
                vars: { t: { $arrayElemAt: ["$topicData", 0] } },
                in: { topicId: "$$t._id", name: "$$t.name", slug: "$$t.slug" },
              },
            }
          : "$topicId",

        // Tags thống nhất 1 màu, FE tự render theo brand (StackOverflow style)
        tags: includeTags
          ? {
              $map: {
                input: "$tagsList",
                as: "tag",
                in: { label: "$$tag.name", slug: "$$tag.slug" },
              },
            }
          : "$tags",
      },
    });
  }

  return pipeline;
};
