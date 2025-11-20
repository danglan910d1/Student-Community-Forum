// Định nghĩa Schema người dùng
// Lưu trữ thông tin cơ bản: name, email (duy nhất), password (hashed).
// Là trung tâm xác thực (Authentication).

import { Schema, model } from "mongoose"; // Import(thêm) Types để dùng cho TypeScript Interface

export type UserRole = "user" | "admin";
export type UserStatus = "active" | "banned";
// Định nghĩa kiểu dữ liệu TypeScript
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole; // Phân quyền người dùng
  avatar?: string | null; // URL ảnh đại diện
  status: UserStatus; // Trạng thái tài khoản
  createdAt: Date; // Mongoose tự động thêm với timestamps: true
  updatedAt: Date; // Mongoose tự động thêm với timestamps: true
  // isVerified: boolean;
  // otpCode?: string;
  // otpExpires?: Date;
}

// Định nghĩa Schema Mongoose (Quy tắc Cơ sở dữ liệu)
/*Cấu trúc new Schema<IUser>({}, {})
  Tham số thứ nhất (First {}): definition (Định nghĩa field). Định nghĩa chi tiết từng field (Field definition).
  Tham số thứ hai (Second {}): options (Tùy chọn Schema). Cấu hình chung của Schema (Schema options).
*/
const userSchema = new Schema<IUser>(
  // Định nghĩa các field và quy tắc của chúng
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Quy tắc của password: Ẩn mật khẩu khi query mặc định
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: {
      type: String,
      default: "https://placehold.co/100x100/CCCCCC/000000?text=A",
    },
    status: { type: String, enum: ["active", "banned"], default: "active" },
    // Loại bỏ định nghĩa thủ công
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
    // isVerified: { type: Boolean }, // Mặc định là FALSE
    // otpCode: { type: String },
    // otpExpires: { type: Date },
  },
  {
    // Tham số 2: Các tùy chọn cấu hình Schema tổng thể
    // Sử dụng timestamps để tự động quản lý
    timestamps: true, // Tuỳ chọn này áp dụng cho tất cả các field
  }
);

export default model<IUser>("User", userSchema);
