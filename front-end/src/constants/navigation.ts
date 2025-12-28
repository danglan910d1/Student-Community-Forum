import { FileText, Hash } from "lucide-react";

export const QUICK_NAV_ITEMS = [
  {
    label: "Bài viết",
    href: "/", // Homepage
    icon: FileText,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Chủ đề",
    href: "/tags", // Trang tags
    icon: Hash,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];
