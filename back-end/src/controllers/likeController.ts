import { Response, Request } from "express";
import { Types, Model, Document } from "mongoose";
import Like, { TargetType } from "../models/Like";
import Post from "../models/Post";
import Comment from "../models/Comment";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { ToggleLikeParams, GetLikeStatusQuery } from "../types/like";
import { addJobToQueue } from "../services/common/jobQueue";

// Interface hỗ trợ ép kiểu cho các Model có thể Like
type LikableDocument = Document & {
  status: string;
  is_deleted: boolean;
  likes_count: number;
};

const likableModels: Record<TargetType, Model<LikableDocument>> = {
  post: Post as unknown as Model<LikableDocument>,
  comment: Comment as unknown as Model<LikableDocument>,
};

// --- [ UTILS: Job Producer ] ---
const addLikeCountJob = (
  targetType: TargetType,
  targetId: string,
  increment: 1 | -1
) => {
  addJobToQueue("updateLikeCounts", {
    targetId,
    targetModelName: targetType === "post" ? "Post" : "Comment",
    update: { $inc: { likes_count: increment } },
  });
};

// --- [ USER: Thích hoặc Bỏ Thích (Toggle) ] ---
export const toggleLike = asyncHandler(
  async (req: AuthenticatedRequest<ToggleLikeParams>, res: Response) => {
    const { targetType, targetId } = req.params;
    const userId = req.userId;

    const Model = likableModels[targetType as TargetType];
    if (!Model) throw new AppError(400, "Invalid target type.");

    // 1. Check Target & Lấy luôn count hiện tại (Chỉ 1 lần truy vấn DB)
    const target = await Model.findOne({
      _id: targetId,
      is_deleted: false,
      status: "approved",
    }).select("likes_count");
    if (!target)
      throw new AppError(404, `${targetType} not found or unavailable.`);

    // 2. Xử lý Toggle Like (Atomic Operation)
    const existingLike = await Like.findOne({
      userId: new Types.ObjectId(userId),
      targetId: new Types.ObjectId(targetId),
      targetType,
    });

    const isLiked = !existingLike;
    const increment = isLiked ? 1 : -1;

    if (existingLike) {
      await existingLike.deleteOne();
    } else {
      await Like.create({
        userId: new Types.ObjectId(userId),
        targetId: new Types.ObjectId(targetId),
        targetType,
      });
    }

    // 3. Chạy Job ngầm cập nhật DB
    addLikeCountJob(targetType as TargetType, targetId, increment);

    // 4. Trả về kết quả: Lấy count từ 'target' tìm được ở bước 1 rồi cộng/trừ local
    // Không cần await Model.findById lần nữa!
    res.json({
      message: isLiked ? "Liked successfully." : "Unliked successfully.",
      isLiked,
      likeCount: (target.likes_count || 0) + increment,
    });
  }
);

// --- [ PUBLIC: Lấy Trạng thái Like & Tổng số Likes ] ---
export const getLikeStatus = asyncHandler(
  async (req: Request<{}, {}, {}, GetLikeStatusQuery>, res: Response) => {
    const { targetType, targetId } = req.query;
    const userId = (req as any).userId;

    const Model = likableModels[targetType as TargetType];
    if (!Model) throw new AppError(400, "Invalid target type.");

    const target = await Model.findById(targetId).select("likes_count");
    if (!target) throw new AppError(404, "Target not found.");

    let isLiked = false;
    if (userId && Types.ObjectId.isValid(userId as string)) {
      isLiked = !!(await Like.exists({
        userId: new Types.ObjectId(userId),
        targetId: new Types.ObjectId(targetId as string),
        targetType,
      }));
    }

    res.json({ isLiked, likes_count: target.likes_count || 0 });
  }
);
