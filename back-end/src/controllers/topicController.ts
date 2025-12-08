/**
 * CONTROLLER: topicController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến Chủ đề (Topic CRUD, Kiểm duyệt).
 * * Nguyên tắc áp dụng: HOF, Type Safety, RBAC Logic, Data Cleaning.
 */
import { Request, Response } from "express";
import Topic, { ITopic } from "../models/Topic"; // <-- Cần import ITopic
import { AuthenticatedRequest } from "../types/express";
import { Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler"; // HOF
import { TopicParams, CreateTopicBody, UpdateTopicBody } from "../types/topic";
import { generateSlug } from "../utils/text";
import {
  buildTopicFilter,
  GetTopicsQuery,
} from "../services/topics/topicFilter";
import { buildTopicAggregationPipeline } from "../services/topics/topicPipeline";
import { paginateAggregation } from "../utils/pagination";

// --- [ PUBLIC/ADMIN: Lấy danh sách Topics (Gộp) ] ---
// FIX N+1: Sử dụng Aggregation Pipeline và buildTopicFilter
// Endpoint: GET /api/topics (Public) HOẶC GET /api/topics/admin (Admin)
export const getTopicsList = asyncHandler(
  async (
    // Sử dụng Request gốc và AuthenticatedRequest để hàm này hoạt động trên cả hai route
    req:
      | Request<{}, {}, {}, GetTopicsQuery>
      | AuthenticatedRequest<{}, {}, {}, GetTopicsQuery>,
    res: Response
  ) => {
    // 1. Lấy tham số query và quyền hạn
    const { page, limit } = req.query;
    const userId = "userId" in req ? req.userId : undefined;
    const isAdmin = "userRole" in req ? req.userRole === "admin" : false;

    const authContext = { userId, isAdmin };

    // 2. XÂY DỰNG BỘ LỌC (Ủy quyền cho Service Layer)
    const filter = buildTopicFilter(req.query, authContext);

    // 3. TẠO AGGREGATION PIPELINE (FIX N+1)
    let pipeline = buildTopicAggregationPipeline(filter, {
      includeCreator: isAdmin, // Chỉ cần populate creator nếu là Admin
      includeProjection: true,
    });

    // 4. GỌI HÀM AGGREGATION PHÂN TRANG (Tái sử dụng tiện ích Post)
    const result = await paginateAggregation(Topic, pipeline, page, limit);

    res.json({
      topics: result.items,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      limit: result.limit,
    });
  }
);

// --- [ ADMIN: Lấy chi tiết Topic bằng ID ] ---
// Endpoint: GET /api/topics/admin/:id
export const getTopicById = asyncHandler(
  async (req: AuthenticatedRequest<TopicParams>, res: Response) => {
    const { id } = req.params;

    // 1: Kiểm tra tính hợp lệ của ID
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Topic ID format." });
    }

    // 2. TÌM TOPIC BẰNG AGGREGATION (FIX N+1)
    const topicArray = await Topic.aggregate([
      ...buildTopicAggregationPipeline(
        { _id: new Types.ObjectId(id) },
        {
          includeCreator: true,
          includeProjection: true,
        }
      ),
    ]).exec();

    const topic = topicArray[0];

    // 3: Kiểm tra Topic có tồn tại không
    if (!topic) {
      return res.status(404).json({ error: "Topic not found." });
    }

    res.json(topic);
  }
);

// --- [ ADMIN: Tạo Topic mới ] ---
// Endpoint: POST /api/topics/admin
export const createTopic = asyncHandler(
  async (req: AuthenticatedRequest<{}, {}, CreateTopicBody>, res: Response) => {
    // 1. Lấy dữ liệu từ body và adminId từ request (đã xác thực)
    const { name, description } = req.body;
    const adminId = req.userId;

    // 2. Kiểm tra tính hợp lệ cơ bản
    if (!name) {
      return res.status(400).json({ error: "Topic name is required." });
    }

    const trimmedName = name.trim();

    // 3. Kiểm tra trùng lặp tên Topic (Dùng trimmedName)
    const topicExists = await Topic.findOne({ name: trimmedName });
    if (topicExists) {
      return res
        .status(400)
        .json({ error: "Topic with this name already exists." });
    }

    // 4. Tạo slug từ tên Topic để sử dụng cho URL
    const slug = generateSlug(trimmedName);

    // 5. Tạo Topic trong Database
    const newTopic = await Topic.create({
      name: trimmedName,
      slug,
      description: description ? description.trim() : undefined, // Làm sạch description
      createdBy: new Types.ObjectId(adminId),
      status: "approved", // QUY TẮC: Admin tạo -> mặc định approved
    });

    res.status(201).json(newTopic);
  }
);

// --- [ ADMIN: Cập nhật Topic (bao gồm cả duyệt status) ] ---
// Endpoint: PUT /api/topics/admin/:id
export const updateTopic = asyncHandler(
  async (
    req: AuthenticatedRequest<TopicParams, {}, UpdateTopicBody>,
    res: Response
  ) => {
    // 1. Lấy ID Topic từ params và dữ liệu cập nhật từ body
    const topicId = req.params.id;
    const { name, description, status } = req.body; // BỔ SUNG: Kiểm tra ID hợp lệ

    if (!Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ error: "Invalid Topic ID format." });
    }
    const updateFields: Partial<ITopic> = {}; // 2. Xử lý trường name và tự động cập nhật slug

    if (name) {
      const trimmedName = name.trim();
      if (trimmedName.length === 0) {
        return res.status(400).json({ error: "Topic name cannot be empty." });
      }
      updateFields.name = trimmedName;
      updateFields.slug = generateSlug(trimmedName);
    } // 3. Xử lý trường description (chấp nhận cả undefined/null)

    if (description !== undefined) {
      // Nếu description không phải null, trim nó
      updateFields.description =
        description === null ? null : description.trim();
    } // 4. Xử lý trường status (Duyệt/Từ chối)

    if (status) {
      // Mongoose sẽ kiểm tra enum với runValidators: true
      updateFields.status = status;
    } // 5. Kiểm tra nếu không có trường nào được cung cấp

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields provided for update." });
    } // 6. Tìm và Cập nhật Topic trực tiếp

    const updatedTopic = await Topic.findByIdAndUpdate(topicId, updateFields, {
      new: true,
      runValidators: true, // Dùng upsert: false để tránh tạo tài liệu mới nếu không tìm thấy
    }); // 7. Kiểm tra kết quả

    if (!updatedTopic) {
      return res.status(404).json({ error: "Topic not found." });
    }

    res.json(updatedTopic);
  }
);
