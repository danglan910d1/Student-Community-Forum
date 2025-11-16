// src/models/Topic.ts

import { Schema, model, Types } from "mongoose";

// Định nghĩa kiểu dữ liệu TypeScript cho Topic
export interface ITopic {
  name: string;
  slug: string;
  description?: string;
  createdBy: Types.ObjectId; // ID của Admin tạo ra Topic
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const topicSchema = new Schema<ITopic>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true }, // Dùng cho URL thân thiện
    description: { type: String },
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
  }
);

export default model<ITopic>("Topic", topicSchema);
