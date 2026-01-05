/**
 * CONTROLLER: userController
 * Trách nhiệm: Xử lý Profile, Password, Admin Controls và Cascade Deletion.
 */
import { Request, Response } from "express";
import * as fs from "fs/promises";
import path from "path";
import bcrypt from "bcrypt";
import { Types } from "mongoose";
import User, { IUser } from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";
import Like from "../models/Like";
import { AuthenticatedRequest } from "../types/express";
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
import { buildUserFilter } from "../services/users/userFilter";
import {
  cacheUser,
  getCache,
  setCache,
  saveIdempotencyResult,
} from "../services/common/redis";
import { UPLOADS_DIR } from "../middleware/multer";
import { buildUserAggregationPipeline } from "../services/users/userPipeline";
import { fetchUserByPipeline } from "../services/users/fetchUserByPipeline";
import { AppError } from "../utils/appError";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// --- [ 1. PROFILE & SECURITY ] ---

/** * GET /api/users/me */
export const getMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await fetchUserByPipeline(
      { _id: new Types.ObjectId(req.userId) },
      true
    );
    if (!user) throw new AppError(404, "User not found.");

    await cacheUser(req.userId!, user);
    res.json(user);
  }
);

/** * PUT /api/users/profile (Update Name/Avatar) */
export const updateProfile = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, UpdateProfileBody> & MulterRequest,
    res: Response
  ) => {
    const userId = req.userId!;
    const { name, avatar } = req.body;
    const requestId = req.headers["x-request-id"] as string;

    const user = await User.findById(userId);
    if (!user) throw new AppError(404, "User not found.");

    const updateFields: Partial<IUser> = {};
    if (name?.trim()) updateFields.name = name.trim();

    // Xử lý Upload Avatar & Xóa ảnh cũ
    if (req.file) {
      const filename = `avatar-${userId}-${Date.now()}${path.extname(
        req.file.originalname
      )}`;
      await fs.writeFile(path.join(UPLOADS_DIR, filename), req.file.buffer);

      // Xóa file cũ nếu có (tránh rác server)
      if (user.avatar && user.avatar.startsWith("/uploads/")) {
        const oldPath = path.join(UPLOADS_DIR, path.basename(user.avatar));
        await fs.unlink(oldPath).catch(() => null);
      }
      updateFields.avatar = `/uploads/${filename}`;
    } else if (avatar === "null") {
      updateFields.avatar = null;
    }

    const updatedUserRaw = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );
    const userData = await fetchUserByPipeline(
      { _id: updatedUserRaw!._id },
      true
    );

    await cacheUser(userId, userData);
    if (requestId)
      await saveIdempotencyResult(requestId, 200, JSON.stringify(userData));

    res.json(userData);
  }
);

/** * PUT /api/users/password (Security) */
export const updatePassword = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, UpdatePasswordBody>,
    res: Response
  ) => {
    const { oldPassword, newPassword } = req.body;
    const requestId = req.headers["x-request-id"] as string;
    if (!oldPassword?.trim() || !newPassword?.trim())
      throw new AppError(400, "Both passwords are required.");

    if (newPassword.length < MIN_PASSWORD_LENGTH)
      throw new AppError(
        400,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
      );

    const user = await User.findById(req.userId).select("+password");
    if (!user) throw new AppError(404, "User not found.");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new AppError(401, "Invalid current password.");

    user.password = await bcrypt.hash(
      newPassword,
      await bcrypt.genSalt(BCRYPT_SALT_ROUNDS)
    );
    await user.save();

    await cacheUser(req.userId!, null, 0); // Invalidate cache
    const result = { message: "Password updated successfully." };
    // IDEMPOTENCY: Lưu kết quả (Chỉ lưu thông báo, KHÔNG lưu mật khẩu)
    if (requestId)
      await saveIdempotencyResult(requestId, 200, JSON.stringify(result));

    res.json(result);
  }
);

// --- [ 2. ADMIN & PUBLIC READS ] ---

/** * GET /api/users/:id */
export const getUserById = asyncHandler(
  async (req: Request<GetUserParams>, res: Response) => {
    const { id } = req.params;
    const currentUserId = (req as any).userId;
    const isAdmin = (req as any).userRole === "admin";
    const canViewFull = !!currentUserId && (isAdmin || currentUserId === id);

    const cacheKey = `user:detail:${canViewFull ? "private" : "public"}:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const user = await fetchUserByPipeline(
      { _id: new Types.ObjectId(id) },
      canViewFull
    );
    if (!user) throw new AppError(404, "User not found.");

    await setCache(cacheKey, user, canViewFull ? 60 : 300);
    res.json(user);
  }
);

/** * GET /api/users (Admin/Public List) */
export const getUsersList = asyncHandler(
  async (req: Request<{}, {}, {}, GetAllUsersQuery>, res: Response) => {
    const isAdmin = (req as any).userRole === "admin";
    const filter = buildUserFilter(req.query, {
      userId: (req as any).userId,
      isAdmin,
    });
    const pipeline = buildUserAggregationPipeline(filter, {
      includeStats: true,
      isAdminView: isAdmin,
    });

    const result = await paginateAggregation(
      User,
      pipeline,
      req.query.page,
      req.query.limit
    );
    res.json({
      users: result.items,
      pagination: {
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: result.limit,
      },
    });
  }
);

// --- [ 3. ADMINISTRATIVE & CASCADE DELETE ] ---

/** * PUT /api/users/admin/:id/status (Admin Only) */
export const updateUserStatus = asyncHandler(
  async (
    req: AuthenticatedRequest<GetUserParams, {}, UpdateUserStatusBody>,
    res: Response
  ) => {
    const requestId = req.headers["x-request-id"] as string;
    if (req.userId === req.params.id)
      throw new AppError(403, "Cannot modify yourself.");

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) throw new AppError(404, "User not found.");

    await cacheUser(req.params.id, null, 0);
    const userData = await fetchUserByPipeline({ _id: updated._id }, true);

    if (requestId)
      await saveIdempotencyResult(requestId, 200, JSON.stringify(userData));

    res.json(userData);
  }
);

/** * DELETE /api/users/:id (Cascade Soft Delete) */
export const deleteUser = asyncHandler(
  async (req: AuthenticatedRequest<GetUserParams>, res: Response) => {
    const targetId = req.params.id || req.userId;
    const requestId = req.headers["x-request-id"] as string;
    if (req.params.id && req.userRole !== "admin")
      throw new AppError(403, "Permission denied.");

    const user = await User.findById(targetId);
    if (!user || user.is_deleted) throw new AppError(404, "User not found.");

    // Soft delete user & obfuscate email
    await User.findByIdAndUpdate(targetId, {
      is_deleted: true,
      email: `${user.email}-del-${Date.now()}`,
    });

    // CASCADE: Xử lý Like, Comment, Post
    await Promise.all([
      Post.updateMany({ userId: targetId }, { is_deleted: true }),
      Comment.updateMany({ userId: targetId }, { is_deleted: true }),
      Like.deleteMany({ userId: targetId }), // Like thường được xóa hẳn để giải phóng count bài viết
      cacheUser(targetId as string, null, 0),
    ]);

    const result = { message: "Account deleted successfully." };
    if (requestId)
      await saveIdempotencyResult(requestId, 200, JSON.stringify(result));

    res.json(result);
  }
);
