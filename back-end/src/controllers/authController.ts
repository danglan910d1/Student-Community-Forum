// src/controllers/authController.ts

import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Lấy secret key từ biến môi trường
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Hàm tạo JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d", // Token hết hạn sau 30 ngày
  });
};

// --- [ Đăng ký ] ---
// Vẫn sử dụng Request gốc vì đây là route công khai
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // 1. Kiểm tra thiếu trường
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please enter all fields." });
    }

    // 2. Kiểm tra user đã tồn tại
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists." });
    }

    // 3. Hash mật khẩu (Bước 3: Đăng ký / Đăng nhập)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Tạo User mới
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword, // Mặc định role: "user", status: "active" (đã định nghĩa trong Schema)
    });

    // 5. Trả về thông tin và token
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: generateToken(newUser._id.toString()),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during registration." });
  }
};

// --- [ Đăng nhập ] ---
// Vẫn sử dụng Request gốc vì đây là route công khai
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm User (cần lấy cả password vì đã đặt select: false)
    const user = await User.findOne({ email }).select("+password");

    // 2. Kiểm tra tồn tại và so sánh mật khẩu
    if (user && (await bcrypt.compare(password, user.password))) {
      // 3. Trả về token và thông tin user
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ error: "Invalid credentials." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during login." });
  }
};

// --- [ Đăng xuất (Stateless) ] ---
export const logout = (req: Request, res: Response) => {
  // Frontend xóa token, Backend chỉ cần phản hồi thành công.
  res.json({ message: "Logged out successfully." });
};
