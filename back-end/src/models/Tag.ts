// src/models/Tag.ts

import { Schema, model, Types } from "mongoose";

export interface ITag {
  name: string;
  topicId?: Types.ObjectId; // Tag có thể thuộc về một Topic cụ thể (Optional)
  createdBy: Types.ObjectId; // ID của User/Admin gợi ý Tag
  status: "pending" | "approved" | "rejected";
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
  }
);

export default model<ITag>("Tag", tagSchema);
