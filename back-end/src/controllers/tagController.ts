// src/controllers/tagController.ts

import { Request, Response } from "express";
import Tag, { ITag } from "../models/Tag";
import { AuthenticatedRequest } from "../types/express";
import { Types } from "mongoose";

// Định nghĩa kiểu dữ liệu cho Params
interface TagParams {
  id: string;
}

interface CreateTagBody {
  name: string;
  topicId?: string; // Optional: ID Topic mà tag này gợi ý
}

interface UpdateTagBody {
  name?: string;
  topicId?: string | null; // Cho phép null để xóa liên kết topic
  status?: "pending" | "approved" | "rejected";
}

// --- [ USER/PUBLIC: Lấy tất cả Tags đã Approved ] ---
export const getApprovedTags = async (req: Request, res: Response) => {
  try {
    // 1. Lấy topicId từ query parameters (ví dụ: /api/tags?topicId=...)
    const { topicId } = req.query; // 2. Thiết lập điều kiện lọc cơ bản: chỉ lấy tags đã "approved"

    const filter: any = { status: "approved" }; // 3. Xử lý lọc theo topicId (nếu có)

    if (
      topicId &&
      typeof topicId === "string" &&
      Types.ObjectId.isValid(topicId)
    ) {
      // Chuyển đổi string thành ObjectId để so sánh chính xác trong MongoDB
      filter.topicId = new Types.ObjectId(topicId);
    } // 4. Thực hiện tìm kiếm và chỉ chọn các trường cần thiết cho public

    const tags = await Tag.find(filter).select("name topicId"); // 5. Phản hồi thành công

    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during fetching tags." });
  }
};

// --- [ USER: Gợi ý/Tạo Tag mới (Mặc định status: pending) ] ---
export const suggestTag = async (
  req: AuthenticatedRequest<{}, {}, CreateTagBody>,
  res: Response
) => {
  try {
    // 1. Lấy dữ liệu từ body và userId từ request (đã xác thực)
    const { name, topicId } = req.body;
    const userId = req.userId; // 2. Kiểm tra tính hợp lệ cơ bản của name

    if (!name) {
      return res.status(400).json({ error: "Tag name is required." });
    } // 3. Kiểm tra trùng lặp tên Tag

    const tagExists = await Tag.findOne({ name });
    if (tagExists) {
      return res
        .status(400)
        .json({ error: "Tag with this name already exists." });
    } // 4. Chuẩn bị dữ liệu cho Tag mới

    const tagData: Partial<ITag> = {
      name, // Gán userId của người tạo (cần chuyển string thành ObjectId)
      createdBy: new Types.ObjectId(userId),
      status: "pending", // QUY TẮC: User tạo -> Mặc định chờ Admin duyệt
    }; // 5. Xử lý topicId (chỉ thêm nếu nó được cung cấp và hợp lệ)

    if (topicId && Types.ObjectId.isValid(topicId)) {
      tagData.topicId = new Types.ObjectId(topicId);
    } // 6. Tạo Tag trong Database

    const newTag = await Tag.create(tagData); // 7. Phản hồi thành công

    res.status(201).json(newTag);
  } catch (error: any) {
    // Xử lý lỗi trùng lặp do unique index (nếu lỗi 11000 xảy ra sau kiểm tra 3)
    if (error.code === 11000) {
      return res.status(400).json({ error: "Tag name must be unique." });
    }
    console.error(error);
    res.status(500).json({ error: "Server error during tag suggestion." });
  }
};

// --- [ ADMIN: Lấy tất cả Tags (kể cả pending) ] ---
export const getAllTagsForAdmin = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // 1. Tìm tất cả Tags (không cần lọc status)
    // 2. Populate các trường liên quan (Topic và User) để Admin dễ quản lý và duyệt
    const tags = await Tag.find()
      .populate("topicId", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 }); // Sắp xếp để xem các tags mới nhất trước // 3. Phản hồi thành công

    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during fetching all tags." });
  }
};

// --- [ ADMIN: Cập nhật Tag và Duyệt Status ] ---
export const updateTag = async (
  req: AuthenticatedRequest<TagParams, {}, UpdateTagBody>,
  res: Response
) => {
  try {
    // 1. Lấy ID Tag từ params và dữ liệu cập nhật từ body
    const tagId = req.params.id;
    const { name, topicId, status } = req.body;

    const updateFields: any = {}; // 2. Xử lý trường name

    if (name) updateFields.name = name; // 3. Xử lý trường topicId (là trường phức tạp nhất)

    if (topicId !== undefined) {
      if (topicId === null) {
        // Trường hợp 3a: Gửi null -> xóa liên kết Topic
        updateFields.topicId = null;
      } else if (Types.ObjectId.isValid(topicId)) {
        // Trường hợp 3b: Gửi string hợp lệ -> gán new ObjectId
        updateFields.topicId = new Types.ObjectId(topicId);
      } else {
        // Trường hợp 3c: Gửi string không hợp lệ
        return res.status(400).json({ error: "Invalid topicId format." });
      }
    } // 4. Xử lý trường status (Duyệt/Từ chối)
    if (status) updateFields.status = status; // 5. Kiểm tra nếu không có trường nào được cung cấp để cập nhật

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields provided for update." });
    } // 6. Thực hiện Tìm kiếm và Cập nhật

    const updatedTag = await Tag.findByIdAndUpdate(tagId, updateFields, {
      new: true, // Trả về tài liệu sau khi cập nhật
      runValidators: true, // Chạy các quy tắc validation của Schema
    }).populate("topicId", "name"); // Populate topic để trả về dữ liệu thân thiện // 7. Kiểm tra kết quả

    if (!updatedTag) {
      return res.status(404).json({ error: "Tag not found." });
    } // 8. Phản hồi thành công

    res.json(updatedTag);
  } catch (error: any) {
    // Xử lý lỗi trùng lặp tên Tag
    if (error.code === 11000) {
      return res.status(400).json({ error: "Tag name must be unique." });
    }
    console.error(error);
    res.status(500).json({ error: "Server error during tag update." });
  }
};
