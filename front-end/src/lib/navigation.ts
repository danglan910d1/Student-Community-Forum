export const determineActiveLabel = (
  pathname: string,
  searchParams: URLSearchParams | null
): string => {
  const tagSlug = searchParams?.get("tag");
  const topicId = searchParams?.get("topic");

  if (tagSlug) return tagSlug;
  if (topicId) return "Bài viết";

  // --- LOGIC PUBLIC PROFILE (Ưu tiên kiểm tra cái chi tiết trước) ---
  // Khớp với: /profile/[id]/posts
  if (pathname.includes("/profile/") && pathname.endsWith("/posts")) {
    return "Bài viết công khai";
  }
  // Khớp với: /profile/[id]
  if (pathname.startsWith("/profile/")) {
    return "Thông tin cá nhân";
  }

  // --- LOGIC DASHBOARD CÁ NHÂN ---
  if (pathname.startsWith("/dashboard/profile")) return "Thông tin tài khoản";
  if (pathname.startsWith("/dashboard/posts")) return "Bài viết của tôi";

  // Logic Public chung
  if (pathname === "/" || pathname.startsWith("/posts")) return "Bài viết";
  if (pathname.startsWith("/topics")) return "Chủ đề";

  // Logic Admin
  if (pathname.startsWith("/dashboard/admin/posts")) return "Quản lý bài viết";
  if (pathname.startsWith("/dashboard/admin/users"))
    return "Quản lý người dùng";
  if (pathname.startsWith("/dashboard/admin/taxonomy"))
    return "Quản lý danh mục";

  return "";
};
