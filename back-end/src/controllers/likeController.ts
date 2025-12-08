/**
 * CONTROLLER: likeController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến Lượt Thích (Like/Unlike) cho Posts và Comments.
 * * Nguyên tắc áp dụng: HOF, Type Safety, Atomic Updates.
 */
import { Response, Request } from "express";
import { Types, Model, Document } from "mongoose";
import Like, { TargetType } from "../models/Like";
import Post, { IPost } from "../models/Post";
import Comment, { IComment } from "../models/Comment";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../utils/asyncHandler";
import { ToggleLikeParams, GetLikeStatusQuery } from "../types/like";
import { addJobToQueue } from "../services/common/jobQueue";

// INTERFACE NỘI BỘ: Định nghĩa một kiểu dữ liệu chung (Base) mà Post và Comment đều tuân thủ.
type BaseLikableDocument = Document & {
  status: string;
  is_deleted: boolean;
  likes_count: number;
};

// Map TargetType sang Model Mongoose tương ứng
interface LikableModels {
  post: Model<IPost | BaseLikableDocument>;
  comment: Model<IComment | BaseLikableDocument>;
}

const likableModels: LikableModels = {
  post: Post as LikableModels["post"],
  comment: Comment as LikableModels["comment"],
};

// Hàm trợ giúp để kiểm tra sự tồn tại của đối tượng mục tiêu (không thay đổi)
const checkTargetExists = async (targetType: TargetType, targetId: string) => {
  const Model = likableModels[
    targetType as keyof LikableModels
  ] as Model<BaseLikableDocument>;

  if (!Model) {
    throw new Error("Invalid target type.");
  }

  const target = await Model.findById(targetId);

  if (!target) return false;

  if (target.status !== "approved" || target.is_deleted) return false;

  return true;
};

// --- [ JOB PRODUCER: Thêm Job đếm Likes ] ---
const addLikeCountJob = (
  targetType: TargetType,
  targetId: string,
  increment: 1 | -1 // Vẫn giữ kiểu dữ liệu này
) => {
  // Xác định tên Model (Post hoặc Comment) để Job Queue biết nên update Collection nào
  const targetModelName = targetType === "post" ? "Post" : "Comment";

  addJobToQueue("updateLikeCounts", {
    targetId: targetId,
    targetModelName: targetModelName, // <-- TRUYỀN TÊN MODEL
    update: { $inc: { likes_count: increment } },
  });
};

// --- [ USER: Thích hoặc Bỏ Thích (Toggle) ] ---
// Endpoint: POST /api/likes/:targetType/:targetId
export const toggleLike = asyncHandler(
  async (req: AuthenticatedRequest<ToggleLikeParams>, res: Response) => {
    const { targetType, targetId } = req.params;
    const userId = req.userId;

    if (
      !Types.ObjectId.isValid(targetId) ||
      !likableModels.hasOwnProperty(targetType)
    ) {
      return res.status(400).json({ error: "Invalid target type or ID." });
    }

    if (!(await checkTargetExists(targetType, targetId))) {
      return res.status(404).json({
        error: `${targetType} not found or not available for liking.`,
      });
    }

    const targetIdObj = new Types.ObjectId(targetId);
    const userIdObj = new Types.ObjectId(userId);

    // Khai báo biến increment để cho phép 0
    let increment: 1 | -1 | 0 = 0;

    // 1. Tìm kiếm nếu người dùng đã thích đối tượng này chưa
    const existingLike = await Like.findOne({
      userId: userIdObj,
      targetId: targetIdObj,
      targetType: targetType,
    });

    let message = "";
    let isLiked = false;

    if (existingLike) {
      // Đã thích -> Bỏ thích: XÓA VÀ GIẢM COUNT
      await existingLike.deleteOne();
      message = `Unliked ${targetType} successfully.`;
      increment = -1;
    } else {
      // Chưa thích -> Thích: TẠO MỚI VÀ TĂNG COUNT
      await Like.create({
        userId: userIdObj,
        targetId: targetIdObj,
        targetType: targetType,
      });
      message = `Liked ${targetType} successfully.`;
      isLiked = true;
      increment = 1;
    }

    // Bỏ qua if (increment !== 0) vì nó luôn đúng

    addLikeCountJob(
      targetType as TargetType,
      targetId,
      increment as 1 | -1 // Dùng Type Assertion để vượt qua kiểm tra nghiêm ngặt
    );

    // Lấy count hiện tại (dùng findById - READ OP) để phản hồi
    const Model = likableModels[
      targetType as keyof LikableModels
    ] as Model<BaseLikableDocument>;

    const updatedTarget = await Model.findById(targetId).select("likes_count");
    const likeCount = updatedTarget?.likes_count || 0;

    // 3. Phản hồi (Client sẽ tự tăng/giảm count để nhất quán trải nghiệm)
    res.json({ message, isLiked, likeCount });
  }
);

// --- [ PUBLIC: Lấy Trạng thái Like của người dùng hiện tại & Tổng số Likes ] ---
export const getLikeStatus = asyncHandler(
  async (
    req:
      | Request<{}, {}, {}, GetLikeStatusQuery>
      | AuthenticatedRequest<{}, {}, {}, GetLikeStatusQuery>,
    res: Response
  ) => {
    const { targetType, targetId } = req.query;
    const userId = "userId" in req ? req.userId : undefined;

    if (
      !targetType ||
      !targetId ||
      !Types.ObjectId.isValid(targetId as string)
    ) {
      return res.status(400).json({ error: "Invalid target type or ID." });
    }

    if (!likableModels.hasOwnProperty(targetType)) {
      return res.status(400).json({ error: "Unsupported target type." });
    }

    const validTargetType = targetType as keyof LikableModels;
    const targetIdObj = new Types.ObjectId(targetId as string);
    let likes_count = 0;
    let isLiked = false;

    const Model = likableModels[validTargetType] as Model<BaseLikableDocument>;

    const target = await Model.findById(targetId as string).select(
      "likes_count"
    );
    likes_count = target?.likes_count || 0;

    if (userId) {
      const existingLike = await Like.findOne({
        userId: new Types.ObjectId(userId),
        targetId: targetIdObj,
        targetType: targetType,
      });
      isLiked = !!existingLike;
    }

    res.json({ isLiked, likes_count });
  }
);
