import mongoose, { Document, Schema, Types } from "mongoose";

// Định nghĩa Interface cho Document
export interface IComment extends Document {
  userId: Types.ObjectId; // Người tạo bình luận
  postId: Types.ObjectId; // Bài viết mà bình luận thuộc về (Cần thiết)
  parentId?: Types.ObjectId; // ID của bình luận cha (để tạo bình luận đa cấp/reply)
  content: string; // Nội dung bình luận
  likes_count: number; // Số lượt thích
  replies_count: number; // Số lượng trả lời trực tiếp (tính toán dựa trên parentId)
  is_deleted: boolean; // Đánh dấu đã xóa mềm (soft delete)
  status: "pending" | "approved" | "rejected"; // Trạng thái kiểm duyệt
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến User Model
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post", // Tham chiếu đến Post Model
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment", // Tham chiếu đến chính Comment Model (cho replies)
      default: null, // Nếu là null thì là bình luận cấp 1
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    likes_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    replies_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    is_deleted: {
      type: Boolean,
      default: false, // Dùng soft delete
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // Bình luận thường được duyệt tự động (có thể thay đổi)
    },
  },
  {
    timestamps: true,
  }
);

// Indexes để tối ưu hóa truy vấn
CommentSchema.index({ postId: 1, parentId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1, createdAt: -1 });

// Tạo Model
const Comment = mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
