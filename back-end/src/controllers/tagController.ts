/**
 * CONTROLLER: tagController
 * * Trách nhiệm: Xử lý Business Logic (Logic Nghiệp vụ) liên quan đến Nhãn (Tag CRUD, Kiểm duyệt).
 * * Nguyên tắc áp dụng: HOF, Type Safety, RBAC Logic, Data Cleaning.
 */
import { Request, Response } from "express";
import Tag, { ITag, TagStatus } from "../models/Tag"; // <-- SỬA: Import Model, ITag, và TagStatus
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
      includeTopic: isAdmin, // Chỉ populate Topic nếu là Admin
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
      // Update Slug nếu tên thay đổi (đảm bảo tính nhất quán)
      updateFields.slug = generateSlug(trimmedName);
    }

    // topicId cần là Types.ObjectId | null
    if (topicId !== undefined) {
      if (topicId === null) {
        updateFields.topicId = null;
      } else if (Types.ObjectId.isValid(topicId)) {
        updateFields.topicId = new Types.ObjectId(topicId);
      } else {
        return res.status(400).json({ error: "Invalid topicId format." });
      }
    }

    if (status) updateFields.status = status;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields provided for update." });
    }

    const updatedTag = await Tag.findByIdAndUpdate(tagId, updateFields, {
      new: true,
      runValidators: true,
    }).populate("topicId", "name");

    if (!updatedTag) {
      return res.status(404).json({ error: "Tag not found after update." });
    }

    res.json(updatedTag);
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
    } // Xóa Tag

    const deletedTag = await Tag.findByIdAndDelete(tagId);

    if (!deletedTag) {
      return res.status(404).json({ error: "Tag not found." });
    }

    // LƯU Ý: Không cần xóa liên đới trong Posts vì Post chỉ giữ ID và Mongoose tự bỏ qua ID không tồn tại.
    res.json({ message: "Tag deleted successfully." });
  }
);
