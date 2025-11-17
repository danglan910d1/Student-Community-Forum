// src/controllers/topicController.ts

import { Request, Response } from "express";
import Topic from "../models/Topic";
import slugify from "slugify";
import { AuthenticatedRequest } from "../types/express";
import { Types } from "mongoose";

// Định nghĩa kiểu dữ liệu cho Params (tham số URL)
interface TopicParams {
  id: string;
}

interface CreateTopicBody {
  name: string;
  description?: string;
}

interface UpdateTopicBody {
  name?: string;
  description?: string;
  status?: "pending" | "approved" | "rejected"; // Dùng cho admin duyệt/cập nhật
}

// --- [ PUBLIC: Lấy tất cả Topics đã Approved ] ---
export const getApprovedTopics = async (req: Request, res: Response) => {
  try {
    // 1. Tìm kiếm tất cả Topics
    // 2. Lọc theo điều kiện: chỉ lấy các Topics có status là "approved"
    const topics = await Topic.find({ status: "approved" })

      // 3. Chỉ chọn các trường cần thiết cho public
      .select("name slug description");

    // 4. Phản hồi thành công
    res.json(topics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during fetching topics." });
  }
};

// --- [ ADMIN: Lấy chi tiết Topic bằng ID ] ---
// Cần authMiddleware & adminMiddleware
export const getTopicById = async (
  req: AuthenticatedRequest<TopicParams>,
  res: Response
) => {
  try {
    const { id } = req.params;

    // 1: Kiểm tra tính hợp lệ của ID
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Topic ID format." });
    }

    // 2: [Tùy chọn] Kiểm tra quyền hạn (Admin)
    // Nếu router không đảm bảo quyền Admin, thêm kiểm tra này:
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin required." });
    }

    // 3: Thực hiện tìm kiếm và Populate
    const topic = await Topic.findById(id) // Populate thông tin người tạo (Admin)
      .populate("createdBy", "username email");

    // 4: Kiểm tra Topic có tồn tại không
    if (!topic) {
      return res.status(404).json({ error: "Topic not found." });
    }

    // 5: Phản hồi thành công
    res.json(topic);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Server error during fetching topic details." });
  }
};

// --- [ ADMIN: Tạo Topic mới ] ---
// Cần authMiddleware & adminMiddleware
export const createTopic = async (
  req: AuthenticatedRequest<{}, {}, CreateTopicBody>,
  res: Response
) => {
  try {
    // 1. Lấy dữ liệu từ body và adminId từ request (đã xác thực)
    const { name, description } = req.body;
    const adminId = req.userId; // ID của Admin đã được gán //

    // 2. Kiểm tra tính hợp lệ cơ bản
    if (!name) {
      return res.status(400).json({ error: "Topic name is required." });
    }

    // 3. Kiểm tra trùng lặp tên Topic
    const topicExists = await Topic.findOne({ name });
    if (topicExists) {
      return res
        .status(400)
        .json({ error: "Topic with this name already exists." });
    }

    // 4. Tạo slug từ tên Topic để sử dụng cho URL
    const slug = slugify(name, { lower: true, locale: "vi" });

    // 5. Tạo Topic trong Database
    const newTopic = await Topic.create({
      name,
      slug,
      description, // Chuyển string thành ObjectId và gán cho createdBy
      createdBy: new Types.ObjectId(adminId), // QUY TẮC: Admin tạo -> mặc định approved
      status: "approved",
    });

    // 6. Phản hồi thành công
    res.status(201).json(newTopic);
  } catch (error: any) {
    // Xử lý lỗi trùng lặp do unique index trên name hoặc slug (lỗi 11000)
    if (error.code === 11000) {
      return res.status(400).json({ error: "Slug or Name already exists." });
    }
    console.error(error);
    res.status(500).json({ error: "Server error during topic creation." });
  }
};

// --- [ ADMIN: Lấy tất cả Topics (kể cả pending/rejected) ] ---
// Cần authMiddleware & adminMiddleware
export const getAllTopicsForAdmin = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // 1. Lấy tất cả topics (bao gồm mọi status)
    const topics = await Topic.find()

      // 2. Sắp xếp theo thời gian tạo mới nhất
      .sort({ createdAt: -1 }); // 3. Phản hồi thành công

    res.json(topics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during fetching all topics." });
  }
};

// --- [ ADMIN: Cập nhật Topic (bao gồm cả duyệt status) ] ---
// Cần authMiddleware & adminMiddleware
export const updateTopic = async (
  req: AuthenticatedRequest<TopicParams, {}, UpdateTopicBody>,
  res: Response
) => {
  try {
    // 1. Lấy ID Topic từ params và dữ liệu cập nhật từ body
    const topicId = req.params.id;
    const { name, description, status } = req.body;

    const updateFields: any = {};

    // 2. Xử lý trường name và tự động cập nhật slug
    if (name) {
      updateFields.name = name;
      updateFields.slug = slugify(name, { lower: true, locale: "vi" });
    }

    // 3. Xử lý trường description (chấp nhận cả undefined/null nếu muốn xóa)
    if (description !== undefined) updateFields.description = description;

    // 4. Xử lý trường status (Duyệt/Từ chối)
    if (status) updateFields.status = status;

    // 5. Kiểm tra nếu không có trường nào được cung cấp
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields provided for update." });
    }

    // 6. Tìm và Cập nhật Topic trực tiếp
    const updatedTopic = await Topic.findByIdAndUpdate(topicId, updateFields, {
      new: true, // Trả về tài liệu sau khi cập nhật
      runValidators: true, // Chạy các quy tắc validation của Schema
    });

    // 7. Kiểm tra kết quả
    if (!updatedTopic) {
      return res.status(404).json({ error: "Topic not found." });
    }

    // 8. Phản hồi thành công
    res.json(updatedTopic);
  } catch (error: any) {
    // Xử lý lỗi trùng lặp (lỗi 11000)
    if (error.code === 11000) {
      return res.status(400).json({ error: "Slug or Name already exists." });
    }
    console.error(error);
    res.status(500).json({ error: "Server error during topic update." });
  }
};
