/**
 * CONTROLLER: userController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến tài khoản người dùng (Profile, Mật khẩu, Admin Controls).
 * * Nguyên tắc áp dụng: HOF, Type Safety, RBAC Logic, Data Cleaning.
 */
import { Request, Response } from "express";
import * as fs from "fs/promises";
import User, { IUser } from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";
import Like from "../models/Like";
import bcrypt from "bcrypt";
import { AuthenticatedRequest } from "../types/express"; // Sử dụng cho các route bảo vệ
import { asyncHandler } from "../utils/asyncHandler";
import { BCRYPT_SALT_ROUNDS, MIN_PASSWORD_LENGTH } from "../config/constants";
import {
  UpdateProfileBody,
  UpdatePasswordBody,
  GetUserParams,
  UpdateUserStatusBody,
  GetAllUsersQuery,
} from "../types/user";
import { paginateAggregation } from "../utils/pagination";
import { buildUserFilter } from "../services/users/userFilter"; // Đã sửa đường dẫn/tên file
import { AuthContext } from "../services/common/buildCommonFilter"; // Thêm import
import {
  cacheUser,
  getCache,
  setCache,
  saveIdempotencyResult,
} from "../services/common/redis";
import path from "path";
import { UPLOADS_DIR } from "../middleware/multer";
import { buildUserAggregationPipeline } from "../services/users/userPipeline";
import { Types } from "mongoose";
import { fetchUserByPipeline } from "../services/users/fetchUserByPipeline";
import { AppError } from "../utils/appError";

// Định nghĩa lại Request cho TypeScript để biết req.file tồn tại sau Multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// --- [ Lấy thông tin User hiện tại ] ---
export const getMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    // const cachedUser = await getCacheUser(userId);
    // if (cachedUser) return res.json(cachedUser);

    const user = await fetchUserByPipeline(
      { _id: new Types.ObjectId(userId) },
      true // Chính chủ xem, hiện stats đầy đủ
    );

    if (!user) throw new AppError(404, "User not found.");

    await cacheUser(userId, user);
    res.json(user);
  }
);

// --- [ Cập nhật Profile ] ---
export const updateProfile = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, UpdateProfileBody> & MulterRequest,
    res: Response
  ) => {
    const userId = req.userId;
    const requestId = req.headers["x-request-id"] as string;
    const { name, avatar } = req.body;
    const uploadedFile = req.file;

    const updateFields: Partial<IUser> = {};
    let newFilename: string | undefined;

    if (name?.trim()) updateFields.name = name.trim();

    if (uploadedFile) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      newFilename = `avatar-${uniqueSuffix}${path.extname(
        uploadedFile.originalname
      )}`;
      updateFields.avatar = `/uploads/${newFilename}`;
    } else if (avatar === "null" || avatar === null) {
      updateFields.avatar = null;
    }

    if (Object.keys(updateFields).length === 0) {
      throw new AppError(400, "No fields provided for update.");
    }

    const updatedUserRaw = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUserRaw) throw new AppError(404, "User not found.");

    // Lưu file vật lý nếu có
    if (uploadedFile && newFilename) {
      await fs.writeFile(
        path.join(UPLOADS_DIR, newFilename),
        uploadedFile.buffer
      );
    }

    // Lấy lại data qua Pipeline để đồng nhất format trả về và cache
    const userData = await fetchUserByPipeline(
      { _id: updatedUserRaw._id },
      true
    );
    await cacheUser(userId, userData);

    if (requestId) {
      await saveIdempotencyResult(
        requestId,
        200,
        JSON.stringify(userData),
        600
      );
    }

    res.json(userData);
  }
);
// --- [ Cập nhật Password ] ---
export const updatePassword = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, UpdatePasswordBody>,
    res: Response
  ) => {
    // 1. Lấy userId và hai mật khẩu từ body
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    // Trim() mật khẩu để loại bỏ khoảng trắng (Fix lỗi 401)
    const trimmedOldPassword = oldPassword ? oldPassword.trim() : "";
    const trimmedNewPassword = newPassword ? newPassword.trim() : "";

    // 2. Kiểm tra thiếu trường: Đảm bảo cả hai mật khẩu đều được cung cấp
    if (!trimmedOldPassword || !trimmedNewPassword) {
      throw new AppError(400, "Please provide both old and new passwords.");
    }

    // KIỂM TRA BẢO MẬT: Mật khẩu mới phải đủ dài
    if (trimmedNewPassword.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(
        400,
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
      );
    }

    // Kiểm tra mật khẩu mới không trùng mật khẩu cũ
    if (trimmedOldPassword === trimmedNewPassword) {
      throw new AppError(
        400,
        "New password must be different from the old password."
      );
    }

    // 3. Tìm User & Mật khẩu cũ: Phải dùng .select("+password") để lấy được mật khẩu hash
    const user = await User.findById(userId).select("+password");
    if (!user) throw new AppError(404, "User not found.");

    // 4. So sánh Mật khẩu Cũ: Kiểm tra tính hợp lệ của mật khẩu cũ
    const isMatch = await bcrypt.compare(trimmedOldPassword, user.password);
    if (!isMatch) throw new AppError(401, "Invalid old password.");

    // 5. Hash Mật khẩu Mới: Hash mật khẩu mới trước khi lưu vào DB
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    user.password = await bcrypt.hash(trimmedNewPassword, salt);

    // 6. Lưu DB: Lưu lại user với mật khẩu mới.
    await user.save();

    // 7. XÓA CACHE: Xóa profile cache vì mật khẩu đã thay đổi (Profile không đổi nhưng đây là biện pháp phòng ngừa)
    // Giả định getCacheUser/cacheUser dùng key 'user:profile:<userId>'
    await cacheUser(userId, null, 0);

    // 8. Thành công
    res.json({ message: "Password updated successfully." });
  }
);

// --- [ PUBLIC/ADMIN: Lấy thông tin chi tiết User theo ID ] ---
export const getUserById = asyncHandler(
  async (
    req: Request<GetUserParams> | AuthenticatedRequest<GetUserParams>,
    res: Response
  ) => {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      throw new AppError(400, "Invalid ID format.");
    }

    // KHÔNG ép kiểu trực tiếp req thành AuthenticatedRequest ngay lập tức
    // vì nếu khách truy cập, req.userId sẽ không tồn tại.
    const currentUserId = (req as any).userId;
    const currentUserRole = (req as any).userRole;

    const isSelf = currentUserId === id;
    const isAdmin = currentUserRole === "admin";

    // canViewFullStats chỉ true khi: có đăng nhập VÀ (là Admin HOẶC là chính chủ)
    const canViewFullStats = !!currentUserId && (isAdmin || isSelf);

    // Tạo Cache Key dựa trên quyền hạn
    const cacheKey = `user:detail:${
      canViewFullStats ? "private" : "public"
    }:${id}`;

    const cachedUser = await getCache(cacheKey);
    if (cachedUser) return res.json(cachedUser);

    const user = await fetchUserByPipeline(
      { _id: new Types.ObjectId(id) },
      canViewFullStats
    );

    if (!user) throw new AppError(404, "User not found.");

    // Lưu Cache với thời gian khác nhau: Admin/Self (60s), Khách (300s)
    await setCache(cacheKey, user, canViewFullStats ? 60 : 300);

    res.json(user);
  }
);

// --- [ PUBLIC/ADMIN: Lấy danh sách Users (Gộp tìm kiếm & lọc) ] ---
// Endpoint: GET /api/users/admin?status=...&role=... (Admin)
// Endpoint: GET /api/users?search=... (Public/Optional Auth)
export const getUsersList = asyncHandler(
  async (req: Request<{}, {}, {}, GetAllUsersQuery>, res: Response) => {
    const { page, limit } = req.query;
    const authContext: AuthContext = {
      userId: (req as any).userId,
      isAdmin: (req as any).userRole === "admin",
    };

    // 1. Tạo Cache Key
    const sortedQuery = Object.keys(req.query)
      .sort()
      .map((k) => `${k}=${(req.query as any)[k]}`)
      .join(":");
    const cacheKey = `users:list:${
      authContext.isAdmin ? "admin" : "public"
    }:${sortedQuery}`;

    const cachedList = await getCache(cacheKey);
    if (cachedList) return res.json(cachedList);

    // 2. Build Filter & Pipeline
    const filter = buildUserFilter(req.query, authContext);
    const pipeline = buildUserAggregationPipeline(filter, {
      includeStats: true,
      isAdminView: authContext.isAdmin,
    });

    // 3. Phân trang Aggregation
    const result = await paginateAggregation(User, pipeline, page, limit);

    const finalResponse = {
      users: result.items,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      limit: result.limit,
    };

    await setCache(cacheKey, finalResponse, authContext.isAdmin ? 60 : 300);
    res.json(finalResponse);
  }
);

// ADMIN
// --- [ ADMIN: Lấy chi tiết User (Email, Status) ] ---
// export const getUserDetails = asyncHandler(
//   async (req: AuthenticatedRequest<GetUserParams>, res: Response) => {
//     // Việc kiểm tra quyền admin đã diễn ra ở tầng route
//     // Lấy ID của người bị tác động từ URL params
//     const userId = req.params.id;

//     // Không cache Admin Details vì dữ liệu này nhạy cảm và thường chỉ được truy cập một lần.

//     // 1. Tìm User: Lấy tất cả thông tin (select không cần trừ password vì nó đã select: false)
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     // 2. Trả về chi tiết (bao gồm email, status, isVerified, v.v.)
//     res.json(user);
//   }
// );

// --- [ ADMIN: Cập nhật Trạng thái User (Ban/Unban) ] ---
export const updateUserStatus = asyncHandler(
  async (
    req: AuthenticatedRequest<GetUserParams, {}, UpdateUserStatusBody>,
    res: Response
  ) => {
    const targetUserId = req.params.id;
    const { status, role } = req.body;

    if (req.userId === targetUserId) {
      throw new AppError(403, "Cannot change your own status/role.");
    }

    const updatedUserRaw = await User.findByIdAndUpdate(
      targetUserId,
      { ...(status && { status }), ...(role && { role }) },
      { new: true, runValidators: true }
    );

    if (!updatedUserRaw) throw new AppError(404, "User not found.");

    const userData = await fetchUserByPipeline(
      { _id: updatedUserRaw._id },
      true
    );
    await cacheUser(targetUserId, null, 0); // Xóa cache cũ

    res.json(userData);
  }
);

// --- [ USER/ADMIN: Xóa User ] ---
export const deleteUser = asyncHandler(
  async (req: AuthenticatedRequest<GetUserParams>, res: Response) => {
    const targetId = req.params.id || req.userId;
    const isAdmin = req.userRole === "admin";

    if (req.params.id && !isAdmin) throw new AppError(403, "Access denied.");

    const user = await User.findByIdAndUpdate(
      targetId,
      { is_deleted: true },
      { new: true }
    );
    if (!user) throw new AppError(404, "User not found.");

    // Soft delete dữ liệu liên quan
    await Promise.all([
      Post.updateMany({ userId: targetId }, { is_deleted: true }),
      Comment.updateMany({ userId: targetId }, { is_deleted: true }),
      Like.updateMany({ userId: targetId }, { is_deleted: true }),
      cacheUser(targetId as string, null, 0),
    ]);

    res.json({ message: "User soft deleted successfully." });
  }
);
