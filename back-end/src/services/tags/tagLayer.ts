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
 * Xử lý đầu vào Tag hỗn hợp (ID và Tên)
 * Đảm bảo tính duy nhất dựa trên ID, Slug và Name (Case-insensitive)
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

  // --- 1. LÀM SẠCH DỮ LIỆU ĐẦU VÀO ---
  // Chuyển tất cả về lowercase để so sánh đồng nhất, loại bỏ khoảng trắng và tag rỗng
  const cleanedInput = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
  const rawUniqueTags = Array.from(new Set(cleanedInput));

  if (rawUniqueTags.length > MAX_TAG_INPUT) {
    warning = `Chỉ cho phép tối đa ${MAX_TAG_INPUT} thẻ cho mỗi bài viết.`;
  }

  const uniqueTags = rawUniqueTags.slice(0, MAX_TAG_INPUT);
  const userObjectId = new Types.ObjectId(userId);

  const tagIdsFromInput: string[] = [];
  const tagNamesFromInput: string[] = [];
  const tagSlugsFromInput: string[] = [];

  // Phân tách ID/Tên để chuẩn bị truy vấn
  for (const item of uniqueTags) {
    if (Types.ObjectId.isValid(item)) {
      tagIdsFromInput.push(item);
    } else {
      tagNamesFromInput.push(item);
      tagSlugsFromInput.push(generateSlug(item));
    }
  }

  // --- 2. TRUY VẤN TẤT CẢ TAG CÓ KHẢ NĂNG TRÙNG LẶP ---
  const existingTags = await Tag.find({
    is_deleted: false,
    $or: [
      { _id: { $in: tagIdsFromInput } },
      { slug: { $in: tagSlugsFromInput } },
      {
        name: {
          $regex: new RegExp(
            `^${tagNamesFromInput
              .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
              .join("|")}$`,
            "i"
          ),
        },
      },
    ],
  }).select("_id name status slug topicId");

  // Map để tra cứu nhanh và đảm bảo tính duy nhất trong kết quả trả về
  // Key là string của ObjectId để Map.set không bị trùng lặp
  const finalTagsMap = new Map<
    string,
    { id: Types.ObjectId; status: string }
  >();
  const tagsToCreateMap = new Map<string, Partial<ITag>>();

  // --- 3. LOGIC PHÂN LOẠI VÀ KIỂM TRA ---
  for (const tagItem of uniqueTags) {
    const isObjectId = Types.ObjectId.isValid(tagItem);
    const itemSlug = isObjectId ? "" : generateSlug(tagItem);

    // Tìm tag hiện có dựa trên ID, Slug hoặc Name
    const foundTag = existingTags.find((t) => {
      if (isObjectId) return t.id.toString() === tagItem;
      return t.slug === itemSlug || t.name.toLowerCase() === tagItem;
    });

    if (foundTag) {
      const tagObjectId = foundTag._id as Types.ObjectId;
      const tagIdStr = tagObjectId.toString();

      // Quyết định tag vào mảng valid hay pending
      const isApproved = foundTag.status === "approved";
      const isTopicValid =
        !foundTag.topicId || foundTag.topicId.equals(topicId);

      const finalStatus = isApproved && isTopicValid ? "valid" : "pending";

      // Map.set sẽ ghi đè nếu trùng tagIdStr, giải quyết vấn đề trùng lặp UI
      finalTagsMap.set(tagIdStr, { id: tagObjectId, status: finalStatus });
    } else if (!isObjectId) {
      // Chỉ tạo mới nếu thực sự không tìm thấy bất kỳ sự trùng lặp nào trong DB
      // Và không trùng với tag khác đang chuẩn bị tạo trong cùng request này
      if (!tagsToCreateMap.has(itemSlug)) {
        tagsToCreateMap.set(itemSlug, {
          name: tagItem,
          slug: itemSlug,
          createdBy: userObjectId,
          status: "pending",
          topicId: topicId,
        });
      }
    }
  }

  // --- 4. TẠO THẺ MỚI (BULK CREATE) ---
  if (tagsToCreateMap.size > 0) {
    try {
      const tagsToCreate = Array.from(tagsToCreateMap.values());
      const createdTags = await Tag.insertMany(tagsToCreate, {
        ordered: false, // Tiếp tục insert các tag khác nếu 1 tag bị trùng (race condition)
      });

      createdTags.forEach((tag) => {
        finalTagsMap.set(tag.id.toString(), {
          id: tag._id as Types.ObjectId,
          status: "pending",
        });
      });
    } catch (error: any) {
      console.error("Lỗi Bulk Create Tags:", error.message);
      // Nếu là lỗi trùng key (11000) do race condition, ta có thể bỏ qua vì tag đã tồn tại
      if (error.code !== 11000) throw error;
    }
  }

  // --- 5. TỔNG HỢP KẾT QUẢ CUỐI CÙNG ---
  finalTagsMap.forEach((val) => {
    if (val.status === "valid") {
      validTagIds.push(val.id);
    } else {
      pendingTagIds.push(val.id);
    }
  });

  return {
    validTagIds,
    pendingTagIds,
    ...(warning && { warning }),
  };
};
