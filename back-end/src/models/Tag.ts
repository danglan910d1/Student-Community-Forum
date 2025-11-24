// src/models/Tag.ts

import { Schema, model, Types, Document } from "mongoose";

// Định nghĩa các loại Status có thể áp dụng cho Tag (Phải khớp với Tag Model)
export type TagStatus = "pending" | "approved" | "rejected";
export interface ITag extends Document {
  name: string;
  topicId?: Types.ObjectId | null; // Tag có thể thuộc về một Topic cụ thể (Optional)
  createdBy: Types.ObjectId; // ID của User/Admin gợi ý Tag
  status: TagStatus;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: false,
    },
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
      // Cho phép các Virtuals (tagId) được bao gồm trong phản hồi JSON
      virtuals: false,
      // Loại bỏ các trường MongoDB nội bộ khỏi phản hồi JSON
      transform: function (doc: Document, ret: any) {
        // 1. Đảm bảo 'id' được tạo ra từ '_id'
        const id = ret._id;
        delete ret._id; // Loại bỏ _id
        delete ret.__v; // Loại bỏ __v
        const newRet: any = {
          tagId: id,
          ...ret,
        };
        return newRet;
      },
    },
  }
);

export default model<ITag>("Tag", tagSchema);
