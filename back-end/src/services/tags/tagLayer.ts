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

  // --- 1. KIỂM TRA VÀ CẮT BỎ GIỚI HẠN (ENFORCEMENT) ---
  const rawUniqueTags = Array.from(new Set(tags.map((t) => t.trim())));

  if (rawUniqueTags.length > MAX_TAG_INPUT) {
    warning = `Input tags were limited from ${rawUniqueTags.length} to the maximum of ${MAX_TAG_INPUT} tags.`;
  }

  // Chỉ xử lý số lượng tối đa cho phép
  const uniqueTags = rawUniqueTags.slice(0, MAX_TAG_INPUT);
  const userObjectId = new Types.ObjectId(userId);
  // const uniqueTags = Array.from(new Set(tags.map((t) => t.trim())));

  const tagIdsFromInput: string[] = [];
  const tagSlugsFromInput: string[] = [];
  const tagNamesMap = new Map<string, string>(); // Lưu trữ tên gốc để tạo Tag mới

  // 1. Phân tách ID/Tên và tạo Slug
  for (const item of uniqueTags) {
    if (!item) continue;
    const trimmedItem = item.trim();

    if (Types.ObjectId.isValid(trimmedItem)) {
      tagIdsFromInput.push(trimmedItem);
    } else {
      const tagSlug = generateSlug(trimmedItem);
      tagSlugsFromInput.push(tagSlug);
      tagNamesMap.set(tagSlug, trimmedItem);
    }
  }

  // 2. Tìm kiếm Tag đã tồn tại (dựa trên ID HOẶC SLUG)
  const existingTags = await Tag.find({
    $or: [
      { _id: { $in: tagIdsFromInput } },
      { slug: { $in: tagSlugsFromInput } },
    ],
  }).select("_id name status slug");

  const existingSlugSet = new Set(existingTags.map((t) => t.slug));

  // 3. Xử lý Tags đã tồn tại và xác định Tags cần tạo mới
  const tagsToCreate: Partial<ITag>[] = [];

  for (const tagItem of uniqueTags) {
    const trimmedItem = tagItem.trim();
    if (!trimmedItem) continue;

    const isObjectId = Types.ObjectId.isValid(trimmedItem);
    const itemSlug = isObjectId ? "" : generateSlug(trimmedItem);

    let foundTag: (ITag & Document) | undefined;

    // Tìm kiếm Tag đã tồn tại theo ID hoặc SLUG
    if (isObjectId) {
      foundTag = existingTags.find((t) => t._id!.toString() === trimmedItem);
    } else {
      foundTag = existingTags.find((t) => t.slug === itemSlug);
    }

    if (foundTag) {
      // Phân loại Tag đã tồn tại
      const tagObjectId = foundTag._id as Types.ObjectId;

      // Tránh thêm trùng do lỗi input
      if (
        validTagIds.some((id) => id.equals(tagObjectId)) ||
        pendingTagIds.some((id) => id.equals(tagObjectId))
      ) {
        continue;
      }

      // Luật ràng buộc hard rules (topic constraint)
      if (foundTag.status === "approved") {
        // Luật Ràng buộc Topic: Tag hợp lệ nếu topicId == null (Free Tag) HOẶC topicId == Post.topicId
        // Kiểm tra `foundTag.topicId` phải tồn tại (không null/undefined) trước khi gọi .equals()
        const isTopicValid =
          !foundTag.topicId || foundTag.topicId.equals(topicId);
        // GIẢI THÍCH:
        // 1. `!foundTag.topicId` trả về true nếu nó là null hoặc undefined (Tag Tự do -> Hợp lệ).
        // 2. Nếu nó là ObjectId, logic chuyển sang `foundTag.topicId.equals(topicId)`.
        if (isTopicValid) {
          // Giai đoạn 1: Tag Approved VÀ Hợp lệ theo Topic -> Gắn ngay (validTagIds)
          validTagIds.push(tagObjectId);
        } else {
          // Giai đoạn 1: Tag Approved nhưng Topic Mismatch -> pending_tags
          pendingTagIds.push(tagObjectId);
        }
      } else {
        // Giai đoạn 1: Tag Pending/Rejected Global -> pending_tags
        pendingTagIds.push(tagObjectId);
      }
    } else if (!isObjectId && !existingSlugSet.has(itemSlug)) {
      // Chỉ tạo mới nếu là TÊN và CHƯA tồn tại trong DB
      tagsToCreate.push({
        name: trimmedItem,
        slug: itemSlug,
        createdBy: userObjectId,
        status: "pending",
        topicId: topicId, // Tag mới được gán Topic ID của Post này (để Admin dễ duyệt)
      } as any);
      existingSlugSet.add(itemSlug); // Khóa slug tạm thời cho bulk insert
    }
  }

  // 4. Bulk create Tag mới và thu thập IDs
  if (tagsToCreate.length > 0) {
    const createdTags = await Tag.insertMany(tagsToCreate);
    createdTags.forEach((tag) => {
      pendingTagIds.push(tag._id as Types.ObjectId);
    });
  }

  return { validTagIds, pendingTagIds, ...(warning && { warning }) };
};
