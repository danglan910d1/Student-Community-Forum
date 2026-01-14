// src/lib/navigation.ts
export const determineActiveLabel = (
  pathname: string,
  topic: string | null
): string => {
  if (topic) return "Bài viết";

  // Logic Dashboard
  if (pathname.startsWith("/dashboard/profile")) return "Thông tin tài khoản";
  if (pathname.startsWith("/dashboard/posts")) return "Bài viết của tôi";

  // Logic Public
  if (pathname === "/" || pathname.startsWith("/posts")) return "Bài viết";
  if (pathname.startsWith("/topics")) return "Chủ đề";

  if (pathname.match(/\/profile\/[^/]+$/)) return "Thông tin cá nhân"; // /profile/abc
  if (pathname.includes("/posts") && pathname.startsWith("/profile/"))
    return "Bài viết công khai"; // /profile/abc/posts

  // Logic Admin
  if (pathname.startsWith("/dashboard/admin/posts")) return "Quản lý bài viết";
  if (pathname.startsWith("/dashboard/admin/users"))
    return "Quản lý người dùng";
  if (pathname.startsWith("/dashboard/admin/taxonomy"))
    return "Quản lý danh mục";

  return "";
};
