import { Tag } from "@/modules/tag/types";
import { generateSlug } from "./slug";

export const validateNewTag = (
  newTagName: string,
  currentTags: Tag[]
): { isValid: boolean; error?: string } => {
  const cleanName = newTagName.trim();
  if (!cleanName) return { isValid: false };

  const newSlug = generateSlug(cleanName);

  // 1. Kiểm tra trùng Slug (Case-insensitive)
  const isDuplicate = currentTags.some(
    (tag) =>
      tag.slug === newSlug || tag.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (isDuplicate) {
    return {
      isValid: false,
      error: "Thẻ này đã tồn tại trong danh sách chọn.",
    };
  }

  // 2. Giới hạn số lượng (Hard rule giống BE)
  if (currentTags.length >= 5) {
    return {
      isValid: false,
      error: "Chỉ được chọn tối đa 5 thẻ.",
    };
  }

  return { isValid: true };
};
