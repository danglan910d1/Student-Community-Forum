import { Response } from "express";
import { Types, Model } from "mongoose";
import Like, { TargetType } from "../models/Like";
import Post from "../models/Post";
import Comment from "../models/Comment";
import { AuthenticatedRequest } from "../types/express";

// Định nghĩa các loại Model có thể được Like để giúp TS và logic
// Sử dụng kiểu Document/Interface cụ thể hơn nếu bạn đã định nghĩa chúng
interface LikableModels {
  post: Model<any>; // Thay any bằng IPost
  comment: Model<any>; // Thay any bằng IComment
}

// Map TargetType sang Model Mongoose tương ứng
const likableModels: LikableModels = {
  post: Post,
  comment: Comment,
  // Thêm các model khác vào đây nếu có (ví dụ: topic, user...)
};

// Định nghĩa kiểu cho Params và Body
interface ToggleLikeParams {
  targetType: TargetType;
  targetId: string;
}

interface GetLikeStatusQuery {
  targetType: TargetType;
  targetId: string;
}

// Hàm trợ giúp để kiểm tra sự tồn tại của đối tượng mục tiêu
const checkTargetExists = async (targetType: TargetType, targetId: string) => {
  // Ép kiểu targetType thành key hợp lệ của LikableModels
  const Model = likableModels[targetType as keyof LikableModels];

  if (!Model) {
    // Logic này vẫn cần thiết nếu TargetType trong Like.ts có nhiều loại hơn
    throw new Error("Invalid target type.");
  }

  // Cast kết quả sang 'any' để truy cập an toàn các thuộc tính động
  const target: any = await Model.findById(targetId);

  if (!target) return false;

  // Đối với Post/Comment, chúng ta chỉ cho phép like các item đã được approved và chưa bị xóa
  if (targetType === "post" && target.status !== "approved") return false;

  if (
    targetType === "comment" &&
    (target.status !== "approved" || target.is_deleted)
  )
    return false;

  return true;
};

// --- [ USER: Thích hoặc Bỏ Thích ] ---
export const toggleLike = async (
  req: AuthenticatedRequest<ToggleLikeParams>,
  res: Response
) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.userId;

    // 1. Kiểm tra tính hợp lệ của tham số
    if (!targetType || !targetId || !Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ error: "Invalid target type or ID." });
    }

    // Đảm bảo targetType hợp lệ (dùng LikableModels để kiểm tra)
    const validTargetType = targetType as keyof LikableModels;
    if (!likableModels.hasOwnProperty(validTargetType)) {
      return res.status(400).json({ error: "Unsupported target type." });
    }

    const targetIdObj = new Types.ObjectId(targetId);
    const userIdObj = new Types.ObjectId(userId);

    // 2. Kiểm tra sự tồn tại và trạng thái của đối tượng mục tiêu
    if (!(await checkTargetExists(targetType, targetId))) {
      return res.status(404).json({
        error: `${targetType} not found or not available for liking.`,
      });
    }

    // 3. Tìm kiếm nếu người dùng đã thích đối tượng này chưa
    const existingLike = await Like.findOne({
      userId: userIdObj,
      targetId: targetIdObj,
      targetType: targetType,
    });

    // 4. Thực hiện Like hoặc Unlike
    let message = "";
    let isLiked = false;
    let likeCount = 0; // Khởi tạo likeCount

    const Model = likableModels[validTargetType]; // Dùng validTargetType đã kiểm tra

    if (existingLike) {
      // Đã thích -> Bỏ thích
      await existingLike.deleteOne();
      message = `Unliked ${targetType} successfully.`;

      // Giảm likes_count trên đối tượng mục tiêu
      const updatedTarget = await Model.findByIdAndUpdate(
        targetId,
        {
          $inc: { likes_count: -1 },
        },
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
      isLiked = true;

      // Tăng likes_count trên đối tượng mục tiêu
      const updatedTarget = await Model.findByIdAndUpdate(
        targetId,
        {
          $inc: { likes_count: 1 },
        },
        { new: true }
      );

      likeCount = updatedTarget?.likes_count || 0;
    }

    // 5. Phản hồi
    // Đã tính toán và trả về likeCount là một số (number)
    res.json({
      message,
      isLiked, // Trạng thái cuối cùng
      likeCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during like operation." });
  }
};

// --- [ PUBLIC: Lấy Trạng thái Like của người dùng hiện tại ] ---
export const getLikeStatus = async (
  req: AuthenticatedRequest<{}, {}, {}, GetLikeStatusQuery>,
  res: Response
) => {
  try {
    const { targetType, targetId } = req.query;
    const userId = req.userId;

    // 1. Kiểm tra tính hợp lệ của tham số
    if (
      !targetType ||
      !targetId ||
      !Types.ObjectId.isValid(targetId as string)
    ) {
      return res.status(400).json({ error: "Invalid target type or ID." });
    }

    // Đảm bảo targetType hợp lệ
    const validTargetType = targetType as keyof LikableModels;
    if (!likableModels.hasOwnProperty(validTargetType)) {
      return res.status(400).json({ error: "Unsupported target type." });
    }

    // 2. Tìm kiếm Like
    const existingLike = await Like.findOne({
      userId: new Types.ObjectId(userId),
      targetId: new Types.ObjectId(targetId as string),
      targetType: targetType,
    });

    // 3. Phản hồi
    const isLiked = !!existingLike;

    // 4. Lấy tổng số likes
    // Dùng validTargetType đã được ép kiểu
    const Model = likableModels[validTargetType];
    let likes_count = 0;
    if (Model) {
      // Cast kết quả sang 'any' để truy cập an toàn 'likes_count'
      const target: any = await Model.findById(targetId as string).select(
        "likes_count"
      );
      likes_count = target?.likes_count || 0;
    }

    res.json({
      isLiked,
      likes_count,
    });
  } catch (error) {
    console.error(error);
    // Nếu xảy ra lỗi server, mặc định trả về false để client không bị lỗi
    res.status(500).json({
      error: "Server error during fetching like status.",
      isLiked: false,
    });
  }
};
