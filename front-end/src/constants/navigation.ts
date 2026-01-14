import { FileText, Hash, UserCircle, Settings } from "lucide-react";

// Dùng cho Trang chủ
export const QUICK_NAV_ITEMS = [
  {
    label: "Bài viết",
    href: "/posts",
    icon: FileText,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Chủ đề",
    href: "/topics",
    icon: Hash,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];

// Dùng cho Dashboard
export const DASHBOARD_NAV_ITEMS = [
  {
    label: "Thông tin tài khoản",
    href: "/dashboard/profile",
    icon: UserCircle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Bài viết của tôi",
    href: "/dashboard/posts",
    icon: FileText,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

// constants/navigation.ts
export const PUBLIC_PROFILE_NAV_ITEMS = (userId: string) => [
  {
    label: "Thông tin cá nhân",
    href: `/profile/${userId}`,
    icon: UserCircle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Bài viết công khai",
    href: `/profile/${userId}/posts`,
    icon: FileText,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

// Thêm vào constants/navigation.ts
export const ADMIN_NAV_ITEMS = [
  {
    label: "Quản lý bài viết",
    href: "/dashboard/admin/posts",
    icon: FileText,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    label: "Quản lý người dùng",
    href: "/dashboard/admin/users",
    icon: UserCircle,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    label: "Quản lý danh mục",
    href: "/dashboard/admin/taxonomy",
    icon: Settings, // Bạn có thể dùng icon Hash hoặc Settings
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
];
