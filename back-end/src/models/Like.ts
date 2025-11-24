import mongoose, { Document, Schema, Types } from "mongoose";

// Định nghĩa các loại đối tượng có thể được "Like"
// CHỈ CHO PHÉP LIKE "post" hoặc "comment"
export type TargetType = "post" | "comment";

// Định nghĩa Interface cho Document
export interface ILike extends Document {
  userId: Types.ObjectId; // Người thích
  targetId: Types.ObjectId; // ID của đối tượng được thích (Post ID, Comment ID,...)
  targetType: TargetType; // Loại đối tượng được thích ("post", "comment",...)
  createdAt: Date;
}

const LikeSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến User Model
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      // Cập nhật Enum, chỉ bao gồm "post" và "comment"
      enum: ["post", "comment"],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Chỉ cần timestamp tạo
    toJSON: {
      // Cho phép các Virtuals (likeId) được bao gồm trong phản hồi JSON
      virtuals: false,
      // Loại bỏ các trường MongoDB nội bộ khỏi phản hồi JSON
      transform: function (doc: Document, ret: any) {
        // 1. Đảm bảo 'id' được tạo ra từ '_id'
        const id = ret._id;
        delete ret._id; // Loại bỏ _id
        delete ret.__v; // Loại bỏ __v
        const newRet: any = {
          likeId: id,
          ...ret,
        };
        return newRet;
      },
    },
  }
);

// Đảm bảo mỗi người dùng chỉ thích một đối tượng một lần
LikeSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

// Tạo Model
const Like = mongoose.model<ILike>("Like", LikeSchema);

export default Like;
