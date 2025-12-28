import { PipelineStage } from "mongoose";

interface CommentPipelineConfig {
  includeUser?: boolean;
  includePost?: boolean;
  includeParent?: boolean;
  includeProjection?: boolean;
  isAdminView?: boolean; // Thêm cờ để biết ai đang xem
}

/**
 * Xây dựng Aggregation Pipeline cho Comment Model.
 * Logic: Giữ nguyên data gốc, chỉ xử lý hiển thị nội dung bị xóa dựa trên quyền hạn.
 */
export const buildCommentAggregationPipeline = (
  filter: any,
  config: CommentPipelineConfig = {}
): PipelineStage[] => {
  const {
    includeUser = true,
    includePost = false,
    includeParent = false,
    includeProjection = true,
    isAdminView = false, // Mặc định là người dùng bình thường xem
  } = config;

  const pipeline: PipelineStage[] = [{ $match: filter }];

  // 1. $lookup User & Xử lý mảng sang Object
  if (includeUser) {
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      }
    );
  }

  // 2. $lookup Post (Dùng cho Admin View)
  if (includePost) {
    pipeline.push({
      $lookup: {
        from: "posts",
        localField: "postId",
        foreignField: "_id",
        as: "post",
      },
    });
  }

  // 3. $lookup Parent (Dùng cho Reply list)
  if (includeParent) {
    pipeline.push({
      $lookup: {
        from: "comments",
        localField: "parentId",
        foreignField: "_id",
        as: "parent",
      },
    });
  }

  // 4. Projection cuối cùng - Logic ẩn nội dung nằm ở đây
  if (includeProjection) {
    pipeline.push({
      $project: {
        _id: 0,
        commentId: "$_id",
        likes_count: 1,
        replies_count: 1,
        is_deleted: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        userId: 1, // Giữ lại ID gốc cho FE nếu cần

        // LOGIC NỘI DUNG:
        // Nếu is_deleted = true VÀ người xem không phải admin -> Hiện thông báo ẩn
        // Ngược lại hiện content thật (Admin thấy mọi thứ, User thấy content bình thường)
        content: {
          $cond: {
            if: {
              $and: [
                { $eq: ["$is_deleted", true] },
                { $eq: [isAdminView, false] },
              ],
            },
            then: "[Bình luận này đã bị xóa.]",
            else: "$content",
          },
        },

        // Gọt sạch User data
        user: includeUser
          ? {
              userId: "$user._id",
              name: "$user.name",
              avatar: "$user.avatar",
            }
          : "$userId",

        postId: includePost ? { $arrayElemAt: ["$post", 0] } : "$postId",
        parentId: includeParent
          ? { $arrayElemAt: ["$parent", 0] }
          : "$parentId",
      },
    });
  }

  return pipeline;
};
