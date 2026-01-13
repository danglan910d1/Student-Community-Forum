import { Types, Document } from "mongoose";
import Tag, { ITag } from "../../models/Tag";
import { generateSlug } from "../../utils/text";

// --- HẰNG SỐ GIỚI HẠN (HARD RULE) ---
const MAX_TAG_INPUT = 5;

// Định nghĩa kiểu trả về của Service
export interface ProcessedTagsResult {
  validTagIds: Types.ObjectId[]; // Tags đã approved (Master)
  pendingTagIds: Types.ObjectId[]; // Tags đang chờ duyệt/đề xuất (Pending/Rejected)
  warning?: string; // Cảnh bảo vượt giới hạn thì lược bỏ
}

/**
 * Xử lý đầu vào Tag hỗn hợp (ID và Tên) để phân loại và tạo Tag mới (Pending) nếu cần.
 * Đây là logic nghiệp vụ cốt lõi về kiểm soát tính duy nhất của Tag.
 * @param tags Mảng IDs và Tên Tag từ input của người dùng.
 * @param userId ID của người dùng tạo bài viết (để gán Tag mới).
 * @param topicId ID của Topic liên quan (để gán cho Tag mới).
 * @returns Object chứa hai mảng ID đã được phân loại (validTagIds và pendingTagIds).
 */
export const processTags = async (
  tags: string[],
  userId: string,
  topicId: Types.ObjectId
): Promise<ProcessedTagsResult> => {
  let validTagIds: Types.ObjectId[] = [];
  let pendingTagIds: Types.ObjectId[] = [];
  let warning: string | undefined;

  if (!tags || tags.length === 0) {
    return { validTagIds, pendingTagIds };
  }

  // --- 1. KIỂM TRA VÀ CẮT BỎ GIỚI HẠN ---
  const rawUniqueTags = Array.from(new Set(tags.map((t) => t.trim())));
  if (rawUniqueTags.length > MAX_TAG_INPUT) {
    warning = `Input tags were limited to the maximum of ${MAX_TAG_INPUT} tags.`;
  }

  const uniqueTags = rawUniqueTags.slice(0, MAX_TAG_INPUT);
  const userObjectId = new Types.ObjectId(userId);

  const tagIdsFromInput: string[] = [];
  const tagSlugsFromInput: string[] = [];

  // 1. Phân tách ID/Tên
  for (const item of uniqueTags) {
    if (!item) continue;
    if (Types.ObjectId.isValid(item)) {
      tagIdsFromInput.push(item);
    } else {
      tagSlugsFromInput.push(generateSlug(item));
    }
  }

  // 2. Tìm kiếm Tag đã tồn tại
  // Chỉnh sửa: Thêm select('topicId') để logic so sánh topicId bên dưới hoạt động
  const existingTags = await Tag.find({
    $or: [
      { _id: { $in: tagIdsFromInput } },
      { slug: { $in: tagSlugsFromInput } },
    ],
  }).select("_id name status slug topicId");

  const existingSlugSet = new Set(existingTags.map((t) => t.slug));
  // 3. Xử lý Tags và xác định Tags cần tạo mới
  const tagsToCreate: Partial<ITag>[] = [];

  for (const tagItem of uniqueTags) {
    const isObjectId = Types.ObjectId.isValid(tagItem);
    const itemSlug = isObjectId ? "" : generateSlug(tagItem);

    let foundTag: (ITag & Document) | undefined;

    if (isObjectId) {
      foundTag = existingTags.find((t) => t.id.toString() === tagItem);
    } else {
      foundTag = existingTags.find((t) => t.slug === itemSlug);
    }

    if (foundTag) {
      const tagObjectId = foundTag._id as Types.ObjectId;

      // Tránh thêm trùng
      if (
        validTagIds.some((id) => id.equals(tagObjectId)) ||
        pendingTagIds.some((id) => id.equals(tagObjectId))
      ) {
        continue;
      }

      if (foundTag.status === "approved") {
        // Tag Approved: Kiểm tra Topic Constraint
        const isTopicValid =
          !foundTag.topicId || foundTag.topicId.equals(topicId);

        if (isTopicValid) {
          validTagIds.push(tagObjectId);
        } else {
          pendingTagIds.push(tagObjectId);
        }
      } else {
        // Tag Pending/Rejected: Luôn vào pending_tags
        pendingTagIds.push(tagObjectId);
      }
    } else if (!isObjectId && !existingSlugSet.has(itemSlug)) {
      // Chỉ tạo mới nếu KHÔNG phải ID và KHÔNG trùng Slug trong DB
      tagsToCreate.push({
        name: tagItem,
        slug: itemSlug,
        createdBy: userObjectId,
        status: "pending",
        topicId: topicId,
      } as any);
      existingSlugSet.add(itemSlug);
    }
  }

  // 4. Bulk create
  if (tagsToCreate.length > 0) {
    const createdTags = await Tag.insertMany(tagsToCreate);
    createdTags.forEach((tag) => {
      pendingTagIds.push(tag._id as Types.ObjectId);
    });
  }

  return { validTagIds, pendingTagIds, ...(warning && { warning }) };
};
