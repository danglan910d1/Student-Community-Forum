import { PipelineStage } from "mongoose";

interface NotificationPipelineConfig {
  includeSender?: boolean;
}

export const buildNotificationAggregationPipeline = (
  filter: any,
  config: NotificationPipelineConfig = {}
): PipelineStage[] => {
  const { includeSender = true } = config;

  const pipeline: PipelineStage[] = [
    { $match: filter },
    { $sort: { createdAt: -1 } }, // Luôn ưu tiên thông báo mới nhất
  ];

  // Lookup để lấy thông tin người gửi (sender)
  if (includeSender) {
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "senderId",
        foreignField: "_id",
        as: "senderData",
      },
    });
  }

  // Giai đoạn then chốt: Làm phẳng ID và định nghĩa cấu trúc trả về
  pipeline.push({
    $project: {
      _id: 0, // Loại bỏ _id gốc
      notificationId: "$_id", // Chuyển _id thành notificationId
      recipientId: 1,
      type: 1,
      // Thay vì để entityId, ta đổi tên thành targetId cho "phẳng"
      targetId: "$entityId", // MongoDB sẽ tự chuyển ObjectId này thành String khi xuất ra
      targetType: "$entityType", // "Post" hoặc "Comment"
      content: 1,
      is_read: 1,
      createdAt: 1,

      // Xử lý object sender tương tự như cách làm với Topic/Post
      sender: includeSender
        ? {
            $let: {
              vars: { s: { $arrayElemAt: ["$senderData", 0] } },
              in: {
                $cond: [
                  { $ifNull: ["$$s", false] },
                  {
                    userId: "$$s._id",
                    name: "$$s.name",
                    avatar: "$$s.avatar",
                  },
                  null,
                ],
              },
            },
          }
        : "$$REMOVE",
    },
  });

  return pipeline;
};
