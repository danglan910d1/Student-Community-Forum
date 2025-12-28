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
    const { name, description } = req.body;
    const adminId = req.userId;

    if (!name)
      return res.status(400).json({ error: "Topic name is required." });

    const trimmedName = name.trim();
    const slug = generateSlug(trimmedName);

    // Kiểm tra trùng lặp (bao gồm cả những cái đã soft delete nếu cần, hoặc bỏ qua)
    const topicExists = await Topic.findOne({
      name: trimmedName,
      is_deleted: false,
    });
    if (topicExists)
      return res.status(400).json({ error: "Topic already exists." });

    const newTopicRaw = await Topic.create({
      name: trimmedName,
      slug,
      description: description?.trim(),
      createdBy: new Types.ObjectId(adminId),
      status: "approved",
      is_deleted: false, // Mặc định false
    });

    // TRẢ VỀ QUA PIPELINE: Để đồng nhất topicId và bỏ _id
    const topicArray = await Topic.aggregate(
      buildTopicAggregationPipeline(
        { _id: newTopicRaw._id },
        { includeCreator: true }
      )
    );

    res.status(201).json(topicArray[0]);
  }
);

// --- [ ADMIN: Cập nhật Topic (bao gồm cả duyệt status) ] ---
// Endpoint: PUT /api/topics/admin/:id
export const updateTopic = asyncHandler(
  async (
    req: AuthenticatedRequest<TopicParams, {}, UpdateTopicBody>,
    res: Response
  ) => {
    const topicId = req.params.id;
    const { name, description, status } = req.body;

    if (!Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ error: "Invalid Topic ID format." });
    }

    const updateFields: Partial<ITopic> = {};
    if (name) {
      updateFields.name = name.trim();
      updateFields.slug = generateSlug(name.trim());
    }
    if (description !== undefined) {
      updateFields.description =
        description === null ? null : description.trim();
    }
    if (status) updateFields.status = status;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields provided for update." });
    }

    const updatedTopicRaw = await Topic.findOneAndUpdate(
      { _id: topicId, is_deleted: false }, // Chỉ update nếu chưa bị xóa
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedTopicRaw)
      return res.status(404).json({ error: "Topic not found." });

    // TRẢ VỀ QUA PIPELINE
    const topicArray = await Topic.aggregate(
      buildTopicAggregationPipeline(
        { _id: updatedTopicRaw._id },
        { includeCreator: true }
      )
    );

    res.json(topicArray[0]);
  }
);

// --- [ ADMIN: Xóa mềm Topic ] ---
// Endpoint: DELETE /api/topics/admin/:id
export const deleteTopic = asyncHandler(
  async (req: AuthenticatedRequest<TopicParams>, res: Response) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Topic ID format." });
    }

    const deletedTopic = await Topic.findByIdAndUpdate(
      id,
      { is_deleted: true },
      { new: true }
    );

    if (!deletedTopic)
      return res.status(404).json({ error: "Topic not found." });

    res.json({ message: "Topic soft deleted successfully." });
  }
);

// --- [ ADMIN: Khôi phục Topic (Soft Delete -> Active) ] ---
// Endpoint: PUT /api/topics/admin/restore/:id
export const restoreTopic = asyncHandler(
  async (req: AuthenticatedRequest<TopicParams>, res: Response) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Topic ID format." });
    }

    const restoredTopic = await Topic.findByIdAndUpdate(
      id,
      { is_deleted: false },
      { new: true }
    );

    if (!restoredTopic) {
      return res.status(404).json({ error: "Topic not found." });
    }

    // TRẢ VỀ QUA PIPELINE ĐỂ ĐỒNG NHẤT DỮ LIỆU
    const topicArray = await Topic.aggregate(
      buildTopicAggregationPipeline(
        { _id: restoredTopic._id },
        { includeCreator: true }
      )
    );

    res.json({
      message: "Topic restored successfully.",
      topic: topicArray[0],
    });
  }
);
