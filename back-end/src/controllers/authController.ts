// src/controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { BCRYPT_SALT_ROUNDS, MIN_PASSWORD_LENGTH } from "../config/constants";
import { LoginBody, RegisterBody } from "../types/user";
import { Types } from "mongoose";

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
      return res
        .status(400)
        .json({
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
    const newUser = await User.create({
      name: processedName,
      email: processedEmail,
      password: hashedPassword,
      // Whitelist các trường khác nếu có (ví dụ: avatar)
      // Chỉ thêm avatar nếu Client gửi và nó không rỗng
      ...(avatar && avatar.trim() ? { avatar: avatar.trim() } : {}), // Mongoose sẽ tự động gán role: "user", status: "active", timestamps.
    });

    // 5. Trả về thông tin và token
    res.status(201).json({
      userID: newUser._id, // Trả về ID dưới dạng userId
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      token: generateToken(
        (newUser.id as Types.ObjectId).toString(),
        newUser.role
      ),
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

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 2. So sánh Mật khẩu GỐC với HASH (Dùng trimmedPassword)
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);

    if (isMatch) {
      // KIỂM TRA BẢO MẬT: Ngăn chặn tài khoản bị cấm đăng nhập
      if (user.status === "banned") {
        return res
          .status(401)
          .json({ error: "Account is banned. Please contact administrator." });
      }

      // 4. Trả về token và thông tin user
      res.json({
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(
          (user._id as Types.ObjectId).toString(),
          user.role
        ),
      });
    } else {
      res.status(401).json({ error: "Invalid credentials." });
    }
  }
);

// Đằng xuất (Stateless - Phi trạng thái)
export const logout = (req: Request, res: Response) => {
  // Frontend xóa token, Backend chỉ cần phản hồi thành công.
  res.json({ message: "Logged out successfully." });
};
