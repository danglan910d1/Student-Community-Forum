/**
 * CONTROLLER: tagController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến Nhãn (Tag CRUD, Kiểm duyệt).
 * * Nguyên tắc áp dụng: HOF, Type Safety, RBAC Logic, Data Cleaning.
 */
import { Request, Response } from "express";
import Tag, { ITag } from "../models/Tag";
import { AuthenticatedRequest } from "../types/express";
import { Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { paginateAggregation } from "../utils/pagination";
import { GetTagsQuery, TagParams, UpdateTagBody } from "../types/tag";
import { buildTagFilter } from "../services/tags/tagFilter";
import { buildTagAggregationPipeline } from "../services/tags/tagPipeline";
import { generateSlug } from "../utils/text";

// --- [ PUBLIC/ADMIN: Lấy danh sách Tags (Gộp) ] ---
// Endpoint: GET /api/tags (Public) HOẶC GET /api/tags/admin (Admin)
// FIX N+1: Sử dụng Aggregation Pipeline và buildTagFilter
// Endpoint: GET /api/tags (Public) HOẶC GET /api/tags/admin (Admin)
export const getTagsList = asyncHandler(
  async (
    req:
      | Request<{}, {}, {}, GetTagsQuery>
      | AuthenticatedRequest<{}, {}, {}, GetTagsQuery>,
    res: Response
  ) => {
    // 1. Lấy tham số query và quyền hạn
    const { page, limit } = req.query;
    const userId = "userId" in req ? req.userId : undefined;
    const isAdmin = "userRole" in req ? req.userRole === "admin" : false;

    const authContext = { userId, isAdmin };
    const query = req.query as GetTagsQuery;

    // 2. XÂY DỰNG BỘ LỌC (Ủy quyền cho Service Layer)
    const filter = buildTagFilter(query, authContext);

    // 3. TẠO AGGREGATION PIPELINE (FIX N+1)
    let pipeline = buildTagAggregationPipeline(filter, {
      includeTopic: true, // Chỉ populate Topic nếu là Admin
      includeCreator: isAdmin, // Chỉ populate Creator nếu là Admin
      includeProjection: true,
    });

    // 4. GỌI HÀM AGGREGATION PHÂN TRANG
    const result = await paginateAggregation(Tag, pipeline, page, limit);

    // 5. Phản hồi
    res.json({
      tags: result.items,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      limit: result.limit,
    });
  }
);

// --- [ ADMIN: Cập nhật Tag và Duyệt Status ] ---
// --- [ ADMIN: Tạo Tag chủ động ] ---
// Endpoint: POST /api/tags/admin
export const createTagByAdmin = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, { name: string; topicId?: string }>,
    res: Response
  ) => {
    const { name, topicId } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Tag name is required." });
    }

    const slug = generateSlug(name.trim());

    // Kiểm tra trùng
    const existing = await Tag.findOne({ slug });
    if (existing)
      return res.status(400).json({ error: "Tag name already exists." });

    // 1. Tạo bản ghi mới
    const newTagRaw = await Tag.create({
      name: name.trim(),
      slug,
      topicId: topicId ? new Types.ObjectId(topicId) : null,
      createdBy: new Types.ObjectId(req.userId),
      status: "approved", // Admin tạo thì mặc định là approved
      is_deleted: false,
    });

    // 2. Trả về qua Pipeline
    const tagArray = await Tag.aggregate(
      buildTagAggregationPipeline(
        { _id: newTagRaw._id },
        { includeTopic: true, includeCreator: true, includeProjection: true }
      )
    );

    res.status(201).json(tagArray[0]);
  }
);

// Endpoint: PUT /api/tags/admin/:id
export const updateTag = asyncHandler(
  async (
    req: AuthenticatedRequest<TagParams, {}, UpdateTagBody>,
    res: Response
  ) => {
    const tagId = req.params.id;
    const { name, topicId, status } = req.body;

    if (!Types.ObjectId.isValid(tagId)) {
      return res.status(400).json({ error: "Invalid Tag ID format." });
    }
    const updateFields: Partial<ITag> = {};

    if (name) {
      const trimmedName = name.trim();
      if (trimmedName.length === 0) {
        return res.status(400).json({ error: "Tag name cannot be empty." });
      }
      updateFields.name = trimmedName;
      updateFields.slug = generateSlug(trimmedName);
    }

    if (topicId !== undefined) {
      updateFields.topicId =
        topicId === null ? null : new Types.ObjectId(topicId);
    }

    if (status) updateFields.status = status;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields provided for update." });
    }

    // 1. Thực hiện Update (Chỉ lấy bản ghi thô để xác nhận tồn tại)
    const updatedTagRaw = await Tag.findOneAndUpdate(
      { _id: tagId, is_deleted: { $ne: true } },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedTagRaw) {
      return res.status(404).json({ error: "Tag not found after update." });
    }

    // 2. SỬ DỤNG PIPELINE ĐỂ FORMAT DỮ LIỆU TRẢ VỀ (Bỏ _id, đổi sang tagId)
    // Thay thế hoàn toàn cho .populate() cũ
    const tagArray = await Tag.aggregate(
      buildTagAggregationPipeline(
        { _id: updatedTagRaw._id },
        {
          includeTopic: true,
          includeCreator: true,
          includeProjection: true,
        }
      )
    );

    res.json(tagArray[0]);
  }
);

// --- [ ADMIN: Lấy chi tiết Tag ] ---
// FIX N+1: Sử dụng Aggregation
// Endpoint: GET /api/tags/admin/:id
export const getTagById = asyncHandler(
  async (req: AuthenticatedRequest<TagParams>, res: Response) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Tag ID format." });
    }

    // 1. TÌM TAG BẰNG AGGREGATION (FIX N+1)
    const tagArray = await Tag.aggregate([
      ...buildTagAggregationPipeline(
        { _id: new Types.ObjectId(id) },
        {
          includeTopic: true,
          includeCreator: true,
          includeProjection: true,
        }
      ),
    ]).exec();

    const tag = tagArray[0];

    if (!tag) {
      return res.status(404).json({ error: "Tag not found." });
    }

    res.json(tag);
  }
);

// --- [ ADMIN: Xóa Tag ] ---
// Endpoint: DELETE /api/tags/admin/:id
export const deleteTag = asyncHandler(
  async (req: AuthenticatedRequest<TagParams>, res: Response) => {
    const tagId = req.params.id;

    if (!Types.ObjectId.isValid(tagId)) {
      return res.status(400).json({ error: "Invalid Tag ID format." });
    }

    // Chuyển findByIdAndDelete sang findByIdAndUpdate
    const deletedTag = await Tag.findByIdAndUpdate(
      tagId,
      { is_deleted: true },
      { new: true }
    );

    if (!deletedTag) return res.status(404).json({ error: "Tag not found." });

    res.json({ message: "Tag moved to trash successfully." });
  }
);

// --- [ ADMIN: Khôi phục Tag ] ---
export const restoreTag = asyncHandler(
  async (req: AuthenticatedRequest<TagParams>, res: Response) => {
    const { id } = req.params;
    const restoredTag = await Tag.findByIdAndUpdate(
      id,
      { is_deleted: false },
      { new: true }
    );
    if (!restoredTag) return res.status(404).json({ error: "Tag not found." });

    const tagArray = await Tag.aggregate(
      buildTagAggregationPipeline(
        { _id: restoredTag._id },
        { includeTopic: true }
      )
    );
    res.json({ message: "Tag restored successfully.", tag: tagArray[0] });
  }
);

// --- [ ADMIN: Duyệt/Cập nhật hàng loạt Tags ] ---
// Body: { ids: ["id1", "id2"], status: "approved" }
export const bulkUpdateTags = asyncHandler(
  async (
    req: AuthenticatedRequest<{}, {}, { ids: string[]; status: string }>,
    res: Response
  ) => {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "List of Tag IDs is required." });
    }

    const result = await Tag.updateMany(
      { _id: { $in: ids.map((id) => new Types.ObjectId(id)) } },
      { $set: { status } }
    );

    res.json({
      message: `Successfully updated ${result.modifiedCount} tags to ${status}.`,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  }
);
