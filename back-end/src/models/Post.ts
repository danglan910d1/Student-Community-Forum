// src/models/Post.ts

import { Schema, model, Types } from "mongoose";

// Định nghĩa kiểu dữ liệu TypeScript cho Post
export interface IPost {
  userId: Types.ObjectId;
  topicId: Types.ObjectId; // BẮT BUỘC
  tags: Types.ObjectId[]; // Chỉ chứa tag đã approved
  title: string;
  content: string;
  status: "pending" | "approved" | "rejected"; // Trạng thái duyệt bài
  is_sticky: boolean; // Ghim bài viết
  views_count: number;
  likes_count: number;
  comments_count: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
        required: false, // tags là optional, nhưng nếu có thì phải là ObjectId hợp lệ
      },
    ],
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    content: { type: String, required: true, minlength: 10 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // QUY TẮC: User tạo -> Mặc định chờ duyệt
    },
    is_sticky: { type: Boolean, default: false }, // Chỉ Admin mới có thể ghim
    views_count: { type: Number, default: 0 },
    likes_count: { type: Number, default: 0 },
    comments_count: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Tạo Index cho các trường thường dùng để truy vấn/lọc
postSchema.index({ topicId: 1, status: 1 });
postSchema.index({ tags: 1, status: 1 });

export default model<IPost>("Post", postSchema);
