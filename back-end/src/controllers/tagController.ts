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
import { paginate } from "../utils/pagination";
import { GetTagsQuery, TagParams, UpdateTagBody } from "../types/tag";

// --- [ PUBLIC/ADMIN: Lấy danh sách Tags (Gộp) ] ---
// Endpoint: GET /api/tags (Public) HOẶC GET /api/tags/admin (Admin)
export const getTagsList = asyncHandler(
  async (
    req:
      | Request<{}, {}, {}, GetTagsQuery>
      | AuthenticatedRequest<{}, {}, {}, GetTagsQuery>,
    res: Response
  ) => {
    // 1. Xác định quyền hạn
    const isAdmin = "userRole" in req ? req.userRole === "admin" : false;

    // SỬA LỖI: ÉP KIỂU req.query thành GetTagsQuery
    const query = req.query as GetTagsQuery;
    const { topicId, page, limit, status } = query; // <-- LẤY THAM SỐ TỪ BIẾN ĐÃ ÉP KIỂU // 2. Thiết lập bộ lọc cơ bản

    const filter: any = {};
    let selectFields = "name topicId";
    // Mặc định cho Public
    let populateFields: { path: string; select: string }[] = [];

    if (!isAdmin) {
      // QUY TẮC PUBLIC: Chỉ lấy tags đã APPROVED
      filter.status = "approved";
    } else {
      // QUY TẮC ADMIN: Lấy tất cả statuses, và populate createdBy/topic
      selectFields += " status createdBy";
      populateFields = [
        { path: "topicId", select: "name slug" },
        { path: "createdBy", select: "name" },
      ];

      // Admin có thể lọc theo status cụ thể
      if (status) {
        const validStatuses: TagStatus[] = ["pending", "approved", "rejected"];
        if (validStatuses.includes(status)) {
          filter.status = status;
        } else {
          return res.status(400).json({ error: "Invalid status value." });
        }
      }
    }

    // 3. Lọc theo Topic ID (Áp dụng cho cả Public và Admin)
    if (
      topicId &&
      typeof topicId === "string" &&
      Types.ObjectId.isValid(topicId)
    ) {
      filter.topicId = new Types.ObjectId(topicId);
    }

    // 4. GỌI HÀM TIỆN ÍCH PHÂN TRANG (Loại bỏ logic tính toán lặp lại)
    const result = await paginate(
      Tag,
      filter,
      { createdAt: -1 }, // Sắp xếp theo thời gian mới nhất
      page, // Truyền trực tiếp query param
      limit, // Truyền trực tiếp query param
      selectFields,
      populateFields
    );

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

// --- [ USER: Gợi ý/Tạo Tag mới (Mặc định status: pending) ] ---
// Endpoint: POST /api/tags
// export const suggestTag = asyncHandler(
//   async (req: AuthenticatedRequest<{}, {}, CreateTagBody>, res: Response) => {
//     // 1. Lấy dữ liệu từ body và userId từ request (đã xác thực)
//     const { name, topicId } = req.body;
//     const userId = req.userId; // 2. Kiểm tra tính hợp lệ cơ bản của name

//     if (!name) {
//       return res.status(400).json({ error: "Tag name is required." });
//     }

//     const trimmedName = name.trim(); // 3. Kiểm tra trùng lặp tên Tag (Dùng tên đã làm sạch)

//     const tagExists = await Tag.findOne({ name: trimmedName });
//     if (tagExists) {
//       return res
//         .status(400)
//         .json({ error: "Tag with this name already exists." });
//     } // 4. Chuẩn bị dữ liệu cho Tag mới

//     const tagData: Partial<ITag> = {
//       name: trimmedName,
//       createdBy: new Types.ObjectId(userId),
//       status: "pending", // QUY TẮC: User tạo -> Mặc định chờ Admin duyệt
//     }; // 5. Xử lý topicId (chỉ thêm nếu nó được cung cấp và hợp lệ)

//     if (topicId && Types.ObjectId.isValid(topicId)) {
//       // Tùy chọn: Thêm kiểm tra Topic status = approved nếu muốn nghiêm ngặt
//       tagData.topicId = new Types.ObjectId(topicId);
//     } // 6. Tạo Tag trong Database

//     const newTag = await Tag.create(tagData); // 7. Phản hồi thành công

//     res.status(201).json(newTag);
//   }
// );

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
    } // BỔ SUNG FIX LỖI: topicId cần là Types.ObjectId | null

    if (topicId !== undefined) {
      if (topicId === null) {
        updateFields.topicId = null; // <-- FIX: Gán null
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
// Endpoint: GET /api/tags/admin/:id
export const getTagById = asyncHandler(
  async (req: AuthenticatedRequest<TagParams>, res: Response) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Tag ID format." });
    }

    const tag = await Tag.findById(id)
      .populate("topicId", "name slug")
      .populate("createdBy", "name username");

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
    } // LƯU Ý: Không cần xóa liên đới trong Posts vì Post chỉ giữ ID và Mongoose tự bỏ qua ID không tồn tại.

    res.json({ message: "Tag deleted successfully." });
  }
);
