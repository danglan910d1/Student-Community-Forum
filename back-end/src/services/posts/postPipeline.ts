import { PipelineStage, Types } from "mongoose";

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
 * @param isAdmin - Boolean
 * @param callerId? - String
 * @returns Mảng các PipelineStage đã được cấu hình.
 */
export const buildPostAggregationPipeline = (
  filter: any,
  config: PostPipelineConfig = {},
  isAdmin: boolean = false,
  callerId?: string
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

  if (callerId) {
    pipeline.push({
      $addFields: {
        isOwner: {
          $eq: ["$userId", new Types.ObjectId(callerId)],
        },
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
        status: {
          $cond: {
            // Nếu là Admin (TRUE), giữ lại giá trị status (status: 1)
            if: isAdmin,
            then: "$status", // Nếu không phải Admin (FALSE), loại bỏ trường này
            else: "$$REMOVE",
          },
        },
        is_sticky: 1,
        createdAt: 1,
        // Định dạng các trường lookup

        // Định dạng lại đối tượng User
        // user: {
        //   $cond: {
        //     // Nếu user là mảng rỗng (không tìm thấy user), trả về null/userId
        //     if: { $eq: ["$user", []] },
        //     then: "$userId", // Hoặc chỉ cần null
        //     else: {
        //       userId: { $arrayElemAt: ["$user._id", 0] }, // Chuyển _id thành userId
        //       name: { $arrayElemAt: ["$user.name", 0] },
        //       avatar: { $arrayElemAt: ["$user.avatar", 0] },
        //       role: { $arrayElemAt: ["$user.role", 0] },
        //       createdAt: { $arrayElemAt: ["$user.createdAt", 0] },
        //       // Bỏ qua trường password
        //       email: {
        //         $cond: {
        //           // Nếu là Admin HOẶC là Owner
        //           if: { $or: [isAdmin, "$isOwner"] },
        //           then: { $arrayElemAt: ["$user.email", 0] },
        //           else: "$$REMOVE",
        //         },
        //       },
        //       status: {
        //         $cond: {
        //           if: { $or: [isAdmin, "$isOwner"] },
        //           then: { $arrayElemAt: ["$user.status", 0] },
        //           else: "$$REMOVE",
        //         },
        //       },
        //     },
        //   },
        // },
        // Định dạng lại đối tượng User (Áp dụng $let để tránh lỗi kiểu dữ liệu)
        user: {
          $cond: {
            // Nếu user là mảng rỗng (không tìm thấy user), trả về userId
            if: { $eq: ["$user", []] },
            then: "$userId",
            else: {
              $let: {
                vars: {
                  userData: { $arrayElemAt: ["$user", 0] }, // Lấy đối tượng user đầu tiên
                },
                in: {
                  userId: "$$userData._id", // Sử dụng $$userData
                  name: "$$userData.name",
                  avatar: "$$userData.avatar",
                  role: "$$userData.role",
                  createdAt: "$$userData.createdAt", // Bỏ qua trường password
                  email: {
                    $cond: {
                      // Nếu là Admin HOẶC là Owner
                      if: { $or: [isAdmin, "$isOwner"] },
                      then: "$$userData.email", // Sử dụng $$userData
                      else: "$$REMOVE",
                    },
                  },
                  status: {
                    $cond: {
                      if: { $or: [isAdmin, "$isOwner"] },
                      then: "$$userData.status", // Sử dụng $$userData
                      else: "$$REMOVE",
                    },
                  },
                },
              },
            },
          },
        },

        // topic: includeTopic ? { $arrayElemAt: ["$topic", 0] } : "$topicId",
        topic: includeTopic
          ? {
              $cond: {
                if: { $eq: ["$topic", []] },
                then: null,
                else: {
                  // Lấy đối tượng Topic đầu tiên ra
                  $let: {
                    vars: {
                      topicData: { $arrayElemAt: ["$topic", 0] },
                    },
                    in: {
                      topicId: "$$topicData._id",
                      name: "$$topicData.name",
                      slug: "$$topicData.slug",
                      status: "$$topicData.status",
                    },
                  },
                },
              },
            }
          : "$topicId",
        // tags: includeTags ? "$tagsData" : "$tags", // Trả về tagsData hoặc mảng ObjectId gốc
        tags: includeTags
          ? {
              $map: {
                input: "$tagsData", // Lấy mảng tag đã lookup
                as: "tag",
                in: {
                  tagId: "$$tag._id",
                  name: "$$tag.name",
                  slug: "$$tag.slug",
                  status: "$$tag.status", // Giữ lại status để kiểm tra
                },
              },
            }
          : "$tags", // Hoặc trả về mảng ObjectId gốc
      },
    });
  }

  return pipeline;
};
