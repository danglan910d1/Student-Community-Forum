import {
  FileText,
  Hash,
  UserCircle,
  Settings,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";

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
// Các mục quản trị cấp cao
export const ADMIN_NAV_GROUPS = {
  system: {
    label: "Quản trị hệ thống",
    triggerLabel: "Người dùng & Bài viết",
    icon: ShieldCheck,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    items: [
      {
        label: "Quản lý bài viết",
        href: "/dashboard/admin/posts",
        icon: FileText,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
      },
      {
        label: "Quản lý người dùng",
        href: "/dashboard/admin/users",
        icon: UserCircle,
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
      },
    ],
  },
  taxonomy: {
    label: "Quản lý danh mục",
    triggerLabel: "Phân loại",
    icon: LayoutGrid, // Icon đại diện cho nhóm danh mục
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    items: [
      {
        label: "Quản lý Chủ đề",
        href: "/dashboard/admin/taxonomy/topic",
        icon: Hash,
        iconBg: "bg-yellow-50",
        iconColor: "text-yellow-600",
      },
      {
        label: "Quản lý Thẻ (Tag)",
        href: "/dashboard/admin/taxonomy/tag",
        icon: Settings,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
    ],
  },
};
