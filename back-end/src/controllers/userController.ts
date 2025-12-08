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
import { paginate } from "../utils/pagination";
import { buildUserFilter } from "../services/users/userFilter"; // Đã sửa đường dẫn/tên file
import { AuthContext } from "../services/common/buildCommonFilter"; // Thêm import
import {
  cacheUser,
  getCache,
  getCacheUser,
  setCache,
  saveIdempotencyResult,
} from "../services/common/redis";
import path from "path";
import { UPLOADS_DIR } from "../middleware/multer";

// Định nghĩa lại Request cho TypeScript để biết req.file tồn tại sau Multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// --- [ Lấy thông tin User hiện tại ] ---
export const getMe = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // 1. Lấy userId: Đã được gán bởi authMiddleware.
    const userId = req.userId;

    // 1. KIỂM TRA CACHE
    const cachedUser = await getCacheUser(userId);
    if (cachedUser) {
      // 1.1. Cache hit: Trả về thông tin từ Redis ngay lập tức
      return res.json(cachedUser);
    }

    // 2. Cache miss: Truy vấn DB
    // Tìm User: Truy vấn DB theo ID. Loại bỏ mật khẩu khỏi kết quả trả về.
    const user = await User.findById(userId).select("-password");

    // 3. Xử lý Lỗi: Nếu không tìm thấy user (trường hợp user bị xóa sau khi cấp token).
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 3. LƯU CACHE (Sử dụng toJSON() để loại bỏ password, _id, __v, và thêm userId)
    const userData = user.toJSON();
    await cacheUser(userId, userData);

    // 4. Thành công: Trả về thông tin user.
    res.json(userData);
  }
);

// --- [ Cập nhật Profile ] ---
export const updateProfile = asyncHandler(
  async (
    // P (Params) = {} | ResBody = {} | ReqBody = UpdateProfileBody | ReqQuery = {}
    // THAY ĐỔI: Hợp nhất AuthenticatedRequest và MulterRequest
    req: AuthenticatedRequest<{}, {}, UpdateProfileBody, {}> & MulterRequest,
    res: Response
  ) => {
    // 1. Lấy userId và dữ liệu cần update
    const userId = req.userId;
    // Lấy Request ID
    const requestId = req.headers["x-request-id"] as string;
    const { name, avatar } = req.body; // avatar là string | null | undefined
    const uploadedFile = req.file; // Lấy file đã upload
    // Khởi tạo updateFields để chỉ cập nhật những trường được gửi
    const updateFields: Partial<IUser> = {};
    let isDataProvided = false;
    let newFilename: string | undefined;

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
    // Trường hợp 1: File mới được upload (Ưu tiên cao nhất)
    if (uploadedFile) {
      // TẠO TÊN FILE MỚI ĐỘC NHẤT (Đồng bộ với logic Disk Storage cũ)
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      newFilename =
        uploadedFile.fieldname +
        "-" +
        uniqueSuffix +
        path.extname(uploadedFile.originalname);
      // Lưu đường dẫn file đã lưu vào thư mục 'uploads'
      updateFields.avatar = `/uploads/${newFilename}`;
      isDataProvided = true; // NOTE: Trong production, bạn cần logic xóa file avatar cũ trong storage tại đây.
    }

    // Trường hợp 2: Người dùng gửi yêu cầu xóa avatar hiện tại
    else if (avatar === "null" || avatar === null) {
      updateFields.avatar = null; // Gán null để xóa URL cũ
      isDataProvided = true;
    }

    // Trường hợp 3: Nếu không có file và không có yêu cầu xóa, ta bỏ qua trường avatar.

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

    // 4. LƯU FILE VẬT LÝ VÀO ĐĨA (CHỈ KHI DB UPDATE THÀNH CÔNG)
    if (uploadedFile && newFilename) {
      try {
        // Ghi Buffer (từ RAM) vào file trên đĩa
        await fs.writeFile(
          path.join(UPLOADS_DIR, newFilename),
          uploadedFile.buffer
        ); // NOTE: Tại đây, bạn có thể thêm logic xóa file avatar cũ khỏi S3/Cloudinary/Local disk
      } catch (diskError) {
        console.error(
          "Lỗi khi lưu file vào đĩa sau khi cập nhật DB:",
          diskError
        ); // Xử lý lỗi: Cân nhắc revert lại DB update hoặc gắn cờ lỗi
      }
    }

    // 6. CẬP NHẬT CACHE: Ghi đè cache với dữ liệu mới
    const userData = updatedUser.toJSON();
    await cacheUser(userId, userData);

    // // 7. Thành công: Trả về thông tin user đã cập nhật (không bao gồm password).
    // res.json(userData);
    // 7. Thành công: LƯU KẾT QUẢ IDEMPOTENCY
    const statusCode = 200;
    const responseBody = JSON.stringify(userData);

    if (requestId) {
      // Lưu kết quả thành công vào Redis (TTL 10 phút)
      await saveIdempotencyResult(requestId, statusCode, responseBody, 600);
      return res.status(statusCode).send(responseBody); // Trả về kết quả đã được stringify
    }

    // Fallback hoặc nếu middleware không được sử dụng
    res.status(statusCode).json(userData);
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

    // 7. XÓA CACHE: Xóa profile cache vì mật khẩu đã thay đổi (Profile không đổi nhưng đây là biện pháp phòng ngừa)
    // Giả định getCacheUser/cacheUser dùng key 'user:profile:<userId>'
    await cacheUser(userId, null, 0);

    // 8. Thành công
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

    // 1. KIỂM TRA CACHE (Sử dụng hàm getCacheUser chung, mặc dù đây là public)
    const cachedUser = await getCacheUser(userId);
    if (cachedUser) {
      return res.json(cachedUser);
    }
    // Cache miss: Tìm User, chỉ chọn các trường công khai (name, avatar, role)
    // 2. Tìm User, chỉ chọn các trường công khai (name, avatar, role)
    const user = await User.findById(userId).select(
      "name avatar role createdAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    // 3. LƯU CACHE
    const userData = user.toJSON();
    await cacheUser(userId, userData);

    // 4. Trả về thông tin công khai
    res.json(userData);
  }
);

// ADMIN
// --- [ ADMIN: Lấy chi tiết User (Email, Status) ] ---
export const getUserDetails = asyncHandler(
  async (req: AuthenticatedRequest<GetUserParams>, res: Response) => {
    // Việc kiểm tra quyền admin đã diễn ra ở tầng route
    // Lấy ID của người bị tác động từ URL params
    const userId = req.params.id;

    // Không cache Admin Details vì dữ liệu này nhạy cảm và thường chỉ được truy cập một lần.

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
    }

    // 6. XÓA CACHE CỦA USER BỊ TÁC ĐỘNG: Đảm bảo cache cũ không còn hiệu lực
    await cacheUser(targetUserId, null, 0);

    // 7. Thành công
    res.json(updatedUser);
  }
);

// --- [ USER/ADMIN: Xóa User ] ---
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

    // 3. Tìm và Xóa User (Soft Delete)
    const user = await User.findByIdAndUpdate(
      userIdToDelete, // Cập nhật is_deleted thành true. Mongoose sẽ tự động cập nhật updatedAt.
      { is_deleted: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 4. XÓA DỮ LIỆU LIÊN QUAN (Soft Delete các tài nguyên liên quan)
    await Post.updateMany({ userId: userIdToDelete }, { is_deleted: true });
    await Comment.updateMany({ userId: userIdToDelete }, { is_deleted: true });
    await Like.updateMany({ userId: userIdToDelete }, { is_deleted: true });

    // 5. XÓA CACHE: Xóa cache của user vừa bị xóa
    await cacheUser(userIdToDelete, null, 0);

    // 6. Thành công
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
    req:
      | AuthenticatedRequest<{}, {}, {}, GetAllUsersQuery>
      | Request<{}, {}, {}, GetAllUsersQuery>,
    res: Response
  ) => {
    // 1. Lấy tham số query và xác định quyền hạn
    const query = req.query;
    const { page, limit } = query;
    // Logic xác định quyền hạn: Kiểm tra req có được gán userId/userRole từ authMiddleware không.
    const authContext: AuthContext = {
      userId: "userId" in req ? req.userId : undefined,
      isAdmin: "userRole" in req ? req.userRole === "admin" : false,
    };

    // 1. TẠO CACHE KEY: Dựa trên quyền hạn (Admin/Public) và tất cả query params
    // Sắp xếp keys để đảm bảo cache key nhất quán: e.g., 'list:public:limit=10:page=1:search=...'
    const queryParams = query as Record<string, string | string[] | undefined>;
    const sortedQuery = Object.keys(query)
      .sort()
      .map((key) => `${key}=${queryParams[key]}`)
      .join(":");
    const cacheKey = `users:list:${
      authContext.isAdmin ? "admin" : "public"
    }:${sortedQuery}`;

    // 2. KIỂM TRA CACHE CHO TOÀN BỘ LIST
    const cachedList = await getCache(cacheKey);
    if (cachedList) {
      return res.json(cachedList);
    }

    // 2. XÂY DỰNG BỘ LỌC
    // filter sẽ không còn chứa is_deleted: false mặc định cho Admin.
    const filter = buildUserFilter(req.query, authContext);

    // --- DEBUG LOG ---
    console.log(
      `[USER LIST DEBUG] Is Admin: ${authContext.isAdmin}, User ID: ${
        authContext.userId || "N/A"
      }`
    );
    // Khi Admin gọi GET /api/users/admin (không query), log sẽ là: { is_deleted: false } nếu code cũ, hoặc {} nếu code mới.
    console.log("[USER LIST DEBUG] Final Filter:", filter);

    // 3. XÁC ĐỊNH FIELDS CẦN CHỌN
    // Admin (Authenticated) thấy đầy đủ trừ password. is_deleted được hiển thị để quản trị
    const selectFields = authContext.isAdmin
      ? "-password" // Admin thấy tất cả, trừ password. (is_deleted được bao gồm)
      : "name avatar role createdAt"; // Public chỉ thấy các trường cơ bản (Cần hiển thị is_deleted để dễ debug)

    // 4. GỌI HÀM TIỆN ÍCH PHÂN TRANG
    const result = await paginate(
      User,
      filter,
      { createdAt: -1 }, // Sắp xếp
      page,
      limit,
      selectFields
    );

    // 6. XÂY DỰNG RESPONSE VÀ LƯU CACHE (Chỉ lưu khi Cache Miss)
    const finalResponse = {
      users: result.items,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      limit: result.limit,
    };
    // TTL ngắn hơn cho list (Admin: 1 phút, Public: 5 phút) vì dữ liệu list thay đổi thường xuyên hơn
    const CACHE_LIST_TTL = authContext.isAdmin ? 60 : 300;
    await setCache(cacheKey, finalResponse, CACHE_LIST_TTL);

    // 7. Phản hồi kèm thông tin phân trang
    res.json(finalResponse);
  }
);
