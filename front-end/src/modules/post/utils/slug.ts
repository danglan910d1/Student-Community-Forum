// modules/post/utils/text.ts

/**
 * Tạo slug từ tên tag để kiểm tra trùng lặp (Case-insensitive & Trim)
 * Đảm bảo logic này khớp 100% với hàm generateSlug ở Backend.
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Khử dấu tiếng Việt
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]/g, "") // GIỐNG HỆT BE: Xóa sạch gạch ngang, cách, ký tự lạ
    .trim();
};
