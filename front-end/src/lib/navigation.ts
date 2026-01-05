export const determineActiveLabel = (
  pathname: string,
  topic: string | null
): string => {
  // Ưu tiên 1: Nếu có topic, chắc chắn là mục "Bài viết" đang được lọc
  if (topic) return "Bài viết";

  // Ưu tiên 2: Kiểm tra chính xác đường dẫn
  if (pathname === "/" || pathname.startsWith("/posts")) {
    return "Bài viết";
  }

  if (pathname.startsWith("/tags")) {
    return "Chủ đề"; // Phải khớp với label trong QUICK_NAV_ITEMS
  }

  return "";
};
