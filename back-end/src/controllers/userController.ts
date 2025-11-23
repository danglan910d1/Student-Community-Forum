// src/controllers/userController.ts
/**
 * CONTROLLER: userController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến tài khoản người dùng (Profile, Mật khẩu, Admin Controls).
 * * Nguyên tắc áp dụng: HOF, Type Safety, RBAC Logic, Data Cleaning.
 */
import { Request, Response } from "express";
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
import { paginate } from "../utils/pagination";

// --- [ Lấy thông tin User hiện tại ] ---
// Hàm này chạy sau authMiddleware, đảm bảo người dùng đã xác thực.
export const getMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // 1. Lấy userId: Đã được gán bởi authMiddleware.
    const userId = req.userId;

    // 2. Tìm User: Truy vấn DB theo ID. Loại bỏ mật khẩu khỏi kết quả trả về.
    const user = await User.findById(userId).select("-password");

    // 3. Xử lý Lỗi: Nếu không tìm thấy user (trường hợp user bị xóa sau khi cấp token).
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 4. Thành công: Trả về thông tin user.
    res.json(user);
  }
);

// --- [ Cập nhật Profile ] ---
export const updateProfile = asyncHandler(
  async (
    // P (Params) = {} | ResBody = {} | ReqBody = UpdateProfileBody | ReqQuery = {}
    req: AuthenticatedRequest<{}, {}, UpdateProfileBody, {}>,
    res: Response
  ) => {
    // 1. Lấy userId và dữ liệu cần update
    const userId = req.userId;
    const { name, avatar } = req.body; // avatar là string | null | undefined

    // Khởi tạo updateFields để chỉ cập nhật những trường được gửi
    const updateFields: Partial<IUser> = {};
    let isDataProvided = false;

    // 2. Xử lý trường name (Áp dụng trim() để làm sạch)
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: "Name cannot be empty." });
      }
      // Áp dụng trim() để đảm bảo name không có khoảng trắng thừa
      updateFields.name = name.trim();
      isDataProvided = true;
    }

    // 3. Xử lý trường avatar
    if (avatar !== undefined) {
      updateFields.avatar = avatar; // Cho phép là null để xóa
      isDataProvided = true;
    }

    // 4. Kiểm tra nếu không có trường nào được gửi
    if (!isDataProvided) {
      return res.status(400).json({ error: "No fields provided for update." });
    }

    // 5. Tìm và Cập nhật trực tiếp
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
      // new: trả về mới, runValidators: kiểm tra Schema
    }).select("-password"); // Lấy hết ngoại trừ password

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // 5. Thành công: Trả về thông tin user đã cập nhật (không bao gồm password).
    res.json(updatedUser);
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
      return res
        .status(400)
        .json({ error: "Please provide both old and new passwords." });
    }

    // KIỂM TRA BẢO MẬT: Mật khẩu mới phải đủ dài
    if (trimmedNewPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      });
    }

    // Kiểm tra mật khẩu mới không trùng mật khẩu cũ
    if (trimmedOldPassword === trimmedNewPassword) {
      return res.status(400).json({
        error: "New password must be different from the old password.",
      });
    }

    // 3. Tìm User & Mật khẩu cũ: Phải dùng .select("+password") để lấy được mật khẩu hash
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 4. So sánh Mật khẩu Cũ: Kiểm tra tính hợp lệ của mật khẩu cũ
    const isMatch = await bcrypt.compare(trimmedOldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid old password." });
    }

    // 5. Hash Mật khẩu Mới: Hash mật khẩu mới trước khi lưu vào DB
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    user.password = await bcrypt.hash(trimmedNewPassword, salt);

    // 6. Lưu DB: Lưu lại user với mật khẩu mới.
    await user.save();

    // 7. Thành công
    res.json({ message: "Password updated successfully." });
  }
);

// --- [ Lấy thông tin User theo ID (Cho mọi người xem) ] ---
export const getUserById = asyncHandler(
  async (req: Request<GetUserParams>, res: Response) => {
    const userId = req.params.id; // Lấy ID từ URL parameter

    // Kiểm tra ID hợp lệ (Fix lỗi 500 khi ID sai format)
    if (!userId || userId.length < 24) {
      // Kiểm tra nhanh format
      return res.status(400).json({ error: "Invalid user ID format." });
    }

    // 1. Tìm User, chỉ chọn các trường công khai (name, avatar, role)
    const user = await User.findById(userId).select(
      "name avatar role createdAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 2. Trả về thông tin công khai
    res.json(user);
  }
);

// ADMIN
// --- [ ADMIN: Lấy chi tiết User (Email, Status) ] ---
export const getUserDetails = asyncHandler(
  async (req: AuthenticatedRequest<GetUserParams>, res: Response) => {
    // Việc kiểm tra quyền admin đã diễn ra ở tầng route
    // Lấy ID của người bị tác động từ URL params
    const userId = req.params.id;

    // 1. Tìm User: Lấy tất cả thông tin (select không cần trừ password vì nó đã select: false)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 2. Trả về chi tiết (bao gồm email, status, isVerified, v.v.)
    res.json(user);
  }
);

// --- [ ADMIN: Cập nhật Trạng thái User (Ban/Unban) ] ---
export const updateUserStatus = asyncHandler(
  async (
    req: AuthenticatedRequest<GetUserParams, {}, UpdateUserStatusBody>,
    res: Response
  ) => {
    const targetUserId = req.params.id; // ID của user bị tác động
    const adminId = req.userId; // ID của admin thực hiện hành động
    const { status, role } = req.body; // 1. KIỂM TRA QUYỀN HẠN: Admin không được tự tác động đến tài khoản của mình

    if (adminId === targetUserId) {
      return res.status(403).json({
        error: "Administrators cannot change their own account status or role.",
      });
    }

    // Sử dụng Partial<IUser> để TypeScript kiểm soát các trường
    const updateFields: Partial<IUser> = {};

    // 2. LỌC và KIỂM TRA GIÁ TRỊ status
    if (status) {
      if (status !== "active" && status !== "banned") {
        return res
          .status(400)
          .json({ error: "Invalid status value (must be active or banned)." });
      }
      updateFields.status = status;
    }

    // 3. LỌC và KIỂM TRA GIÁ TRỊ role
    if (role) {
      if (role !== "user" && role !== "admin") {
        return res
          .status(400)
          .json({ error: "Invalid role value (must be user or admin)." });
      }
      updateFields.role = role;
    }

    // 4. KIỂM TRA LỖI: Báo lỗi nếu không có trường nào được cung cấp
    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid status or role field provided for update." });
    }

    // 5. Tìm và Cập nhật trạng thái/role
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    } // 6. Thành công

    res.json(updatedUser);
  }
);

// --- [ USER/ADMIN: Xóa User ] ---
// Hàm này được dùng cho cả: DELETE /me (tự xóa) và DELETE /:id (Admin xóa người khác)
export const deleteUser = asyncHandler(
  async (req: AuthenticatedRequest<GetUserParams>, res: Response) => {
    const callerId = req.userId; // ID người thực hiện hành động (User hoặc Admin)
    const targetUserIdInParams = req.params.id; // ID người bị tác động (Chỉ có trong DELETE /:id)
    const isAdmin = req.userRole === "admin";

    // 1. XÁC ĐỊNH ID CẦN XÓA (Target ID)
    // Nếu có ID trong params (Admin đang xóa người khác), dùng ID đó.
    // Nếu không (DELETE /me), dùng ID của người gọi.
    const userIdToDelete = targetUserIdInParams
      ? targetUserIdInParams
      : callerId;

    // 2. KIỂM TRA QUYỀN HẠN
    // Rule 2a: User thường không được xóa người khác
    if (targetUserIdInParams && !isAdmin) {
      return res.status(403).json({
        error: "Access denied. You do not have permission to delete this user.",
      });
    }

    // Rule 2b: Admin không được tự xóa tài khoản của mình qua DELETE /:id
    if (targetUserIdInParams && isAdmin && targetUserIdInParams === callerId) {
      return res.status(403).json({
        error:
          "Administrators must use the /me endpoint to delete their own account.",
      });
    }

    // Đảm bảo có ID để xóa
    if (!userIdToDelete) {
      return res.status(400).json({ error: "User ID to delete is missing." });
    }

    // 3. Tìm và Xóa User (Hard Delete)
    const user = await User.findByIdAndDelete(userIdToDelete);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 4. XÓA DỮ LIỆU LIÊN QUAN (Data Integrity)
    // Khi người dùng bị xóa, tất cả nội dung do họ tạo ra cũng phải bị xóa theo.
    // 4a. Xóa tất cả Bài viết, Comments, và Likes do User này tạo ra
    await Post.deleteMany({ userId: userIdToDelete });
    await Comment.deleteMany({ userId: userIdToDelete });
    await Like.deleteMany({ userId: userIdToDelete });

    // 5. Thành công
    res.json({
      message: `User ${user.name} and all associated data have been successfully deleted.`,
    });
  }
);

// --- [ PUBLIC/ADMIN: Lấy danh sách Users (Gộp tìm kiếm & lọc) ] ---
// Endpoint: GET /api/users/admin?status=...&role=... (Admin)
// Endpoint: GET /api/users?search=... (Public/Optional Auth)
export const getUsersList = asyncHandler(
  async (
    // Sử dụng AuthenticatedRequest để lấy userId/userRole nếu có (Optional Auth)
    // Cần đảm bảo rằng route Public sẽ không có authMiddleware bắt buộc.
    req:
      | AuthenticatedRequest<{}, {}, {}, GetAllUsersQuery>
      | Request<{}, {}, {}, GetAllUsersQuery>,
    res: Response
  ) => {
    // 1. Lấy tham số query và xác định quyền hạn
    const { page, limit, status, role, search } = req.query;
    const isPublic = !("userId" in req); // Nếu userId không tồn tại, thì đây là request Public

    // 2. Thiết lập bộ lọc (Business Logic)
    const filter: any = {};
    let selectFields = "name avatar role createdAt"; // Mặc định cho Public
    let searchFields: string[] = ["name"]; // Mặc định Public chỉ tìm kiếm theo Tên

    if (isPublic) {
      // QUY TẮC PUBLIC: Chỉ thấy tài khoản đang ACTIVE
      filter.status = "active";
    } else {
      // QUY TẮC ADMIN/AUTHENTICATED:
      selectFields = "-password"; // Admin được phép thấy tất cả trừ password
      searchFields = ["name", "email"]; // Admin được phép tìm kiếm theo Tên VÀ Email

      // Thêm lọc theo Status (Chỉ khi Admin cung cấp query param)
      if (status && (status === "active" || status === "banned")) {
        filter.status = status;
      }
      // Thêm lọc theo Role (Chỉ khi Admin cung cấp query param)
      if (role && (role === "user" || role === "admin")) {
        filter.role = role;
      }
    }

    // 3. Xử lý Tìm kiếm chung
    if (search) {
      const regex = new RegExp(search as string, "i"); // 'i' cho case-insensitive

      // Tạo điều kiện tìm kiếm $or
      const orConditions = searchFields.map((field) => ({
        [field]: { $regex: regex },
      }));

      // Chỉ áp dụng $or nếu có điều kiện khác, hoặc nếu đó là tìm kiếm duy nhất
      if (orConditions.length > 0) {
        filter.$or = orConditions;
      }
    }

    // 4. GỌI HÀM TIỆN ÍCH PHÂN TRANG (Loại bỏ logic tính toán lặp lại)
    const result = await paginate(
      User,
      filter,
      { createdAt: -1 }, // Sắp xếp
      page,
      limit,
      selectFields
    );

    // 5. Phản hồi kèm thông tin phân trang
    res.json({
      users: result.items,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      limit: result.limit,
    });
  }
);
