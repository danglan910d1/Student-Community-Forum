import slugify from "slugify";

/**
 * Tạo slug từ một chuỗi, đảm bảo tính nhất quán (chữ thường và loại bỏ dấu).
 * @param text Chuỗi đầu vào (ví dụ: Tên Tag).
 * @returns Slug đã chuẩn hóa.
 */
export const generateSlug = (text: string): string => {
  return slugify(text, { lower: true, locale: "vi" });
};
