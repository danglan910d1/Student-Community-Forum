// src/models/Topic.ts

import { Schema, model, Types, Document } from "mongoose";
import { generateSlug } from "../utils/text";

// Định nghĩa các loại Status có thể áp dụng cho Topic (Phải khớp với Topic Model)
export type TopicStatus = "pending" | "approved" | "rejected";

// Định nghĩa kiểu dữ liệu TypeScript cho Topic
export interface ITopic extends Document {
  name: string;
  slug: string;
  description?: string | null;
  createdBy: Types.ObjectId; // ID của Admin tạo ra Topic
  status: TopicStatus;
  createdAt: Date;
  updatedAt: Date;
}

const topicSchema = new Schema<ITopic>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true }, // Dùng cho URL thân thiện
    description: { type: String, default: null },
    // Tham chiếu đến UserSchema
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Cho phép các Virtuals (topicId) được bao gồm trong phản hồi JSON
      virtuals: false,
      // Loại bỏ các trường MongoDB nội bộ khỏi phản hồi JSON
      transform: function (doc: Document, ret: any) {
        // 1. Đảm bảo 'id' được tạo ra từ '_id'
        const id = ret._id;
        delete ret._id; // Loại bỏ _id
        delete ret.__v; // Loại bỏ __v
        const newRet: any = {
          topicId: id,
          ...ret,
        };
        return newRet;
      },
    },
  }
);

// PRE-SAVE HOOK: Tự động tạo slug trước khi lưu
topicSchema.pre<ITopic>("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    // Sử dụng hàm tiện ích đã tách ra
    this.slug = generateSlug(this.name);
  }
  next();
});

export default model<ITopic>("Topic", topicSchema);
