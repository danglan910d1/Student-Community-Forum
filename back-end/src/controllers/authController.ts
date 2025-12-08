// src/controllers/authController.ts
import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import {
  BCRYPT_SALT_ROUNDS,
  MIN_PASSWORD_LENGTH,
  JWT_EXPIRATION_SECONDS,
} from "../config/constants";
import { LoginBody, RegisterBody, UserResponseData } from "../types/user";
import { Types } from "mongoose";
import {
  addRevokedToken,
  cacheUser,
  clearLoginFailure,
  clearRateLimitsByIdentifier,
  handleLoginFailure,
  isAccountLockedOut,
} from "../services/common/redis";
import { AuthenticatedRequest } from "../types/express";

// Đăng ký tài khoản
export const register = asyncHandler(
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { name, email, password, avatar } = req.body;

    // 1. Kiểm tra thiếu trường (BẮT BUỘC)
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please enter all fields." });
    }

    // KIỂM TRA MẬT KHẨU: Đảm bảo mật khẩu đủ dài
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      });
    }

    // XỬ LÝ DỮ LIỆU ĐỊNH DANH (BẮT BUỘC)
    const processedEmail = email.trim().toLowerCase();
    const processedName = name.trim();

    // 2. Kiểm tra user đã tồn tại (Dùng processedEmail)
    const userExists = await User.findOne({ email: processedEmail });
    if (userExists) {
      return res.status(400).json({ error: "User already exists." });
    }

    // 3. Hash mật khẩu (Bước 3: Đăng ký / Đăng nhập)
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS); // Sử dụng hằng số
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Tạo User mới
    const newUser = (await User.create({
      name: processedName,
      email: processedEmail,
      password: hashedPassword,
      // Whitelist các trường khác nếu có (ví dụ: avatar)
      // Chỉ thêm avatar nếu Client gửi và nó không rỗng
      ...(avatar && avatar.trim() ? { avatar: avatar.trim() } : {}), // Mongoose sẽ tự động gán role: "user", status: "active", timestamps.
    })) as IUser; // Ép kiểu thành IUser để đảm bảo TS nhận ra method // Nếu JWT không có JTI, bạn sẽ dùng userId làm ID để thu hồi

    // Giả định generateToken trả về một Token có JWT ID (JTI) hoặc dùng User ID làm JTI
    const userId = (newUser.id as Types.ObjectId).toString();
    // 1. Tạo token
    const token = generateToken(userId, newUser.role); // <-- Giả định token có chứa ID/JTI

    // 2. Lấy đối tượng đã được TRANSFORM với kiểu dữ liệu đã định nghĩa rõ
    const userResponse: UserResponseData = newUser.getUserResponseData();

    // 3. Lưu User Profile vào Redis Cache
    await cacheUser(userResponse.userId, {
      id: userResponse.userId,
      role: userResponse.role,
      name: userResponse.name,
    });

    // XÓA GIỚI HẠN IP CŨ KHI ĐĂNG KÝ THÀNH CÔNG
    const userIp = req.ip;
    if (userIp) {
      // Xóa giới hạn IP trên các key 'rate:auth' (bao gồm /register và /login)
      await clearRateLimitsByIdentifier(userIp, "rate:auth");
      await clearRateLimitsByIdentifier(userIp, "rate:general");
    }

    res.status(201).json({
      userId: userResponse.userId,
      name: userResponse.name,
      email: userResponse.email,
      role: userResponse.role,
      avatar: userResponse.avatar,
      token: token,
    });
  }
);

// Đăng nhập tài khoản
export const login = asyncHandler(
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email, password } = req.body;

    // Làm sạch dữ liệu để tìm kiếm (BẮT BUỘC)
    const trimmedEmail = email ? email.trim().toLowerCase() : "";
    const trimmedPassword = password ? password.trim() : "";

    // Kiểm tra thiếu trường
    if (!trimmedEmail || !trimmedPassword) {
      return res
        .status(400)
        .json({ error: "Please provide both email and password." });
    }

    // 1. Tìm User (sử dụng trimmedEmail để tìm kiếm chính xác trong DB)
    const user = await User.findOne({ email: trimmedEmail }).select(
      "+password"
    );

    let loginSuccess = false;
    const userIp = req.ip;

    // KHỐI LOGIC XÁC THỰC
    if (user) {
      // KIỂM TRA KHÓA TẠM THỜI (TỐI ƯU HÓA CPU: CHẠY TRƯỚC KIỂM TRA MẬT KHẨU)
      const isLockedOut = await isAccountLockedOut(trimmedEmail);
      if (isLockedOut) {
        // Tài khoản bị khóa, xử lý như một thất bại
        console.log(`[LOCKOUT] Account ${trimmedEmail} is currently locked.`);
        return res.status(401).json({ error: "Invalid credentials." });
      } // KIỂM TRA MẬT KHẨU

      if (await bcrypt.compare(trimmedPassword, user.password)) {
        loginSuccess = true;
      }
    }

    // LOGIC CHUNG
    if (loginSuccess) {
      // THÀNH CÔNG
      // XÓA BỘ ĐẾM THẤT BẠI VÀ TRẠNG THÁI KHÓA
      await clearLoginFailure(trimmedEmail);

      // KIỂM TRA BẢO MẬT: Ngăn chặn tài khoản bị cấm đăng nhập
      if (user!.status === "banned") {
        // user! an toàn vì loginSuccess là true
        return res
          .status(401)
          .json({ error: "Account is banned. Please contact administrator." });
      }

      // Lấy đối tượng phản hồi đã được transform
      const userResponse: UserResponseData = user!.getUserResponseData();

      // 3. Tạo token
      const token = generateToken(userResponse.userId, userResponse.role); // <-- Giả định token có chứa ID/JTI

      // 4. Lưu User Profile vào Redis Cache (Dành cho đăng nhập thành công)
      await cacheUser(userResponse.userId, {
        id: userResponse.userId,
        role: userResponse.role,
        name: userResponse.name,
      });

      // XÓA GIỚI HẠN IP CŨ
      if (userIp) {
        // Xóa tất cả giới hạn IP trong các danh mục 'rate:auth' và 'rate:general'
        // để giải phóng cho user mới này (B) và những user khác dùng cùng IP
        await clearRateLimitsByIdentifier(userIp, "rate:auth");
        await clearRateLimitsByIdentifier(userIp, "rate:general");
      }
      // 5. Trả về token và thông tin user
      res.json({
        userId: userResponse.userId,
        name: userResponse.name,
        email: userResponse.email,
        role: userResponse.role,
        avatar: userResponse.avatar,
        token: token,
      });
    } else {
      // LOGIC THẤT BẠI (FAILURE LOGIC)
      // XỬ LÝ THẤT BẠI: Tăng bộ đếm Email
      // Chỉ tăng bộ đếm nếu User tồn tại (đã tìm thấy user trong DB)
      if (user) {
        await handleLoginFailure(trimmedEmail, userIp || "0.0.0.0"); // TRUYỀN IP ĐỂ XÓA KEY IP KHI LOCKOUT
      }

      // Trả về lỗi chung
      return res.status(401).json({ error: "Invalid credentials." });
    }
  }
);

// Đằng xuất (Stateless - Phi trạng thái)
// (Sử dụng Redis để thu hồi Token)
// export const logout = (req: Request, res: Response) => {
//   // Frontend xóa token, Backend chỉ cần phản hồi thành công.
//   res.json({ message: "Logged out successfully." });
// };

export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // 1. Lấy token/ID cần thu hồi
    // Lấy JTI (hoặc User ID) từ Request đã được authMiddleware xác thực
    const userId = req.userId; // Sử dụng userId
    // 1. Lấy token/ID cần thu hồi
    // Giả định: Bạn đã sửa authMiddleware để gán Token thô (hoặc JTI) vào req.headers.authorization
    const jwtIdToRevoke = req.headers.authorization?.split(" ")[1];

    // 2. Thu hồi Token trong Redis
    if (jwtIdToRevoke) {
      await addRevokedToken(jwtIdToRevoke, JWT_EXPIRATION_SECONDS);
      console.log(
        `Token/Session revoked for user ID: ${userId}, ID: ${jwtIdToRevoke}`
      );
    }

    // 3. Phản hồi thành công
    res.json({ message: "Logged out successfully." });
  }
);
