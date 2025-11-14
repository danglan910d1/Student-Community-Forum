// src/models/Topic.ts (Đổi tên từ Topis.ts)

import { Schema, Types, model } from "mongoose";

// Định nghĩa kiểu dữ liệu TS cho Topic
export interface ITopic {
  name: string;
  slug: string; // Tên không dấu, dùng cho URL
  description?: string;
  createdBy: Types.ObjectId; // User tạo ra Topic (thường là Admin)
  status: "pending" | "approved" | "rejected";
  // Mongoose tự động thêm
  createdAt: Date;
  updatedAt: Date;
}

// Định nghĩa Schema Mongoose
const TopicSchema = new Schema<ITopic>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    // Tham chiếu đến User Model
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Topic = model<ITopic>("Topic", TopicSchema);
