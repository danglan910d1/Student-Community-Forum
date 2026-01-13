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
  {
    label: "Thiết lập",
    href: "/dashboard/settings",
    icon: Settings,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
];
