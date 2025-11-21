// src/controllers/authController.ts

import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { BCRYPT_SALT_ROUNDS } from "../config/constants";
import { LoginBody, RegisterBody } from "../types/user";

// --- [ Đăng ký ] ---
// Vẫn sử dụng Request gốc vì đây là route công khai
// export const register = async (req: Request, res: Response) => {
//   try {
//     const { name, email, password } = req.body;

//     // 1. Kiểm tra thiếu trường
//     if (!name || !email || !password) {
//       return res.status(400).json({ error: "Please enter all fields." });
//     }

//     // BỔ SUNG: XỬ LÝ DỮ LIỆU ĐỊNH DANH (BẮT BUỘC)
//     const processedEmail = email.trim().toLowerCase();
//     const processedName = name.trim(); // 2. Kiểm tra user đã tồn tại

//     const userExists = await User.findOne({ email: processedEmail });
//     if (userExists) {
//       return res.status(400).json({ error: "User already exists." });
//     }

//     // 3. Hash mật khẩu (Bước 3: Đăng ký / Đăng nhập)
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // 4. Tạo User mới
//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword, // Mặc định role: "user", status: "active" (đã định nghĩa trong Schema)
//     });

//     // 5. Trả về thông tin và token
//     res.status(201).json({
//       _id: newUser._id,
//       name: newUser.name,
//       email: newUser.email,
//       role: newUser.role,
//       token: generateToken(newUser._id.toString()),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error during registration." });
//   }
// };
// Update sử dụng asyncHandler đã định nghĩa
export const register = asyncHandler(
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { name, email, password, avatar } = req.body;

    // 1. Kiểm tra thiếu trường
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please enter all fields." });
    }

    // XỬ LÝ DỮ LIỆU ĐỊNH DANH (BẮT BUỘC)
    const processedEmail = email.trim().toLowerCase();
    const processedName = name.trim();

    // 2. Kiểm tra user đã tồn tại
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
      ...(avatar && avatar.trim() ? { avatar: avatar.trim() } : {}), // Mongoose sẽ tự động gán role: "user", status: "active", timestamps.
    });

    // 5. Trả về thông tin và token
    res.status(201).json({
      userID: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      token: generateToken(newUser._id.toString(), newUser.role),
    });
  }
);

// --- [ Đăng nhập ] ---
// Vẫn sử dụng Request gốc vì đây là route công khai
export const login = asyncHandler(
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email, password } = req.body;

    // Làm sạch dữ liệu để tìm kiếm
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
        token: generateToken(user._id.toString(), user.role),
      });
    } else {
      res.status(401).json({ error: "Invalid credentials." });
    }
  }
);

// --- [ Đăng xuất (Stateless) ] ---
export const logout = (req: Request, res: Response) => {
  // Frontend xóa token, Backend chỉ cần phản hồi thành công.
  res.json({ message: "Logged out successfully." });
};
