// src/lib/navigation.ts
export const determineActiveLabel = (
  pathname: string,
  topic: string | null
): string => {
  if (topic) return "Bài viết";

  // Logic Dashboard
  if (pathname.startsWith("/dashboard/profile")) return "Thông tin tài khoản";
  if (pathname.startsWith("/dashboard/posts")) return "Bài viết của tôi";
  if (pathname.startsWith("/dashboard/settings")) return "Thiết lập";

  // Logic Public
  if (pathname === "/" || pathname.startsWith("/posts")) return "Bài viết";
  if (pathname.startsWith("/topics")) return "Chủ đề";

  if (pathname.match(/\/profile\/[^/]+$/)) return "Thông tin cá nhân"; // /profile/abc
  if (pathname.includes("/posts") && pathname.startsWith("/profile/"))
    return "Bài viết công khai"; // /profile/abc/posts

  return "";
};
