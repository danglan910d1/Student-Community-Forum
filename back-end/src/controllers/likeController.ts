/**
 * CONTROLLER: likeController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến Lượt Thích (Like/Unlike) cho Posts và Comments.
 * * Nguyên tắc áp dụng: HOF (Hàm Bậc cao hơn), Type Safety (An toàn kiểu dữ liệu), Atomic Updates (Cập nhật nguyên tử).
 */
import { Response, Request } from "express";
import { Types, Model, Document } from "mongoose";
import Like, { TargetType } from "../models/Like";
import Post from "../models/Post";
import Comment from "../models/Comment";
import { AuthenticatedRequest } from "../types/express";
import { asyncHandler } from "../utils/asyncHandler";
// BỔ SUNG: Import Interfaces từ file Types API
import { ToggleLikeParams, GetLikeStatusQuery } from "../types/like.api";

// INTERFACE NỘI BỘ: Định nghĩa một kiểu dữ liệu chung (Base) mà Post và Comment đều tuân thủ.
// SỬA LỖI: Loại bỏ 'any' bằng cách định nghĩa kiểu cơ sở chung.
// Cần tất cả các thuộc tính này để Controller hoạt động
type BaseLikableDocument = Document & {
  status: string;
  is_deleted: boolean;
  likes_count: number;
};

// Map TargetType sang Model Mongoose tương ứng
// KHÔNG CẦN AS ANY NỮA VÌ CÁC MODELS ĐÃ ĐƯỢC ĐỒNG BỘ HÓA
interface LikableModels {
  post: Model<BaseLikableDocument>;
  comment: Model<BaseLikableDocument>;
}

const likableModels: LikableModels = {
  post: Post as LikableModels["post"],
  comment: Comment as LikableModels["comment"],
};

// Hàm trợ giúp để kiểm tra sự tồn tại của đối tượng mục tiêu
const checkTargetExists = async (targetType: TargetType, targetId: string) => {
  // Ép kiểu targetType thành key hợp lệ của LikableModels
  const Model = likableModels[targetType as keyof LikableModels];

  if (!Model) {
    throw new Error("Invalid target type.");
  } // 1. Tìm đối tượng mục tiêu (Type Safety đã được cải thiện)

  const target = await Model.findById(targetId);

  if (!target) return false; // 2. Kiểm tra điều kiện: APPROVED và KHÔNG bị xóa // Logic này hoạt động cho cả Post và Comment vì cả hai đều có status và is_deleted.

  if (target.status !== "approved" || target.is_deleted) return false;

  return true;
};

// --- [ USER: Thích hoặc Bỏ Thích (Toggle) ] ---
// Endpoint: POST /api/likes/:targetType/:targetId
export const toggleLike = asyncHandler(
  async (req: AuthenticatedRequest<ToggleLikeParams>, res: Response) => {
    const { targetType, targetId } = req.params;
    const userId = req.userId; // 1. Kiểm tra tính hợp lệ và sự tồn tại/trạng thái của mục tiêu

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
    const Model = likableModels[targetType as keyof LikableModels]; // 2. Tìm kiếm nếu người dùng đã thích đối tượng này chưa

    const existingLike = await Like.findOne({
      userId: userIdObj,
      targetId: targetIdObj,
      targetType: targetType,
    });

    let message = "";
    let isLiked = false;
    let likeCount = 0;
    if (existingLike) {
      // Đã thích -> Bỏ thích
      await existingLike.deleteOne();
      message = `Unliked ${targetType} successfully.`; // Giảm likes_count (Atomic Update)

      const updatedTarget = await Model.findByIdAndUpdate(
        targetId,
        { $inc: { likes_count: -1 } },
        { new: true }
      );
      likeCount = updatedTarget?.likes_count || 0;
    } else {
      // Chưa thích -> Thích
      await Like.create({
        userId: userIdObj,
        targetId: targetIdObj,
        targetType: targetType,
      });
      message = `Liked ${targetType} successfully.`;
      isLiked = true; // Tăng likes_count (Atomic Update)

      const updatedTarget = await Model.findByIdAndUpdate(
        targetId,
        { $inc: { likes_count: 1 } },
        { new: true }
      );
      likeCount = updatedTarget?.likes_count || 0;
    } // 3. Phản hồi

    res.json({ message, isLiked, likeCount });
  }
);

// --- [ PUBLIC: Lấy Trạng thái Like của người dùng hiện tại & Tổng số Likes ] ---
// Endpoint: GET /api/likes?targetType=...&targetId=...
export const getLikeStatus = asyncHandler(
  async (
    req:
      | Request<{}, {}, {}, GetLikeStatusQuery>
      | AuthenticatedRequest<{}, {}, {}, GetLikeStatusQuery>,
    res: Response
  ) => {
    const { targetType, targetId } = req.query;
    const userId = "userId" in req ? req.userId : undefined; // Optional Auth // 1. Kiểm tra tính hợp lệ của tham số

    if (
      !targetType ||
      !targetId ||
      !Types.ObjectId.isValid(targetId as string)
    ) {
      return res.status(400).json({ error: "Invalid target type or ID." });
    } // Đảm bảo targetType hợp lệ

    if (!likableModels.hasOwnProperty(targetType)) {
      return res.status(400).json({ error: "Unsupported target type." });
    }

    const validTargetType = targetType as keyof LikableModels;
    const targetIdObj = new Types.ObjectId(targetId as string);
    let likes_count = 0;
    let isLiked = false; // 2. Lấy tổng số likes (Luôn chạy)

    const Model = likableModels[validTargetType];
    const target = await Model.findById(targetId as string).select(
      "likes_count"
    );
    likes_count = target?.likes_count || 0; // 3. Tìm kiếm Trạng thái Like của người dùng hiện tại (CHỈ KHI ĐĂNG NHẬP)

    if (userId) {
      const existingLike = await Like.findOne({
        userId: new Types.ObjectId(userId),
        targetId: targetIdObj,
        targetType: targetType,
      });
      isLiked = !!existingLike;
    } // 4. Phản hồi

    res.json({ isLiked, likes_count });
  }
);
