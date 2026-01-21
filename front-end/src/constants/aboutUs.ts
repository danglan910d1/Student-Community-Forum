// constants/about-data.ts
import { Layers, Server, Database } from "lucide-react";

export const ABOUT_MISSION = {
  title: "Tại sao là Student Forum?",
  description:
    "Sinh viên thường gặp khó khăn trong việc tìm kiếm tài liệu chuẩn, kết nối với tiền bối hoặc đơn giản là một nơi để thảo luận văn minh. Chúng tôi giải quyết điều đó bằng công nghệ.",
};

export const TECH_STACK = [
  {
    title: "Modern Frontend Stack",
    icon: Layers,
    color: "text-blue-500",
    items: [
      "Next.js 14 App Router & Server Actions",
      "TanStack Query v5 (Optimistic UI)",
      "Zustand State Management & Shadcn UI",
      "SEO & Core Web Vitals Optimization",
    ],
  },
  {
    title: "Scalable Backend Core",
    icon: Server,
    color: "text-purple-500",
    items: [
      "Clean Architecture & Layered Pattern", //
      "Redis Distributed Rate Limiting", //
      "Idempotency Control (Prevent Duplicates)", //
      "Aggregation Pipeline Driven Data", //
    ],
  },
  {
    title: "Data & Security Infrastructure",
    icon: Database,
    color: "text-emerald-500",
    items: [
      "MongoDB Partial Indexes & Soft Delete", //
      "RBAC (Role-Based Access Control)", //
      "Redis Caching Strategy (TTL & Invalidation)", //
      "Real-time Analytics & View Counters", //
    ],
  },
];

export const TEAM_MEMBERS = [
  {
    name: "Đặng Thị Ngọc Lan",
    role: "Project Leader & Fullstack Developer",
    avatar: "L",
    gradient: "from-blue-600 to-cyan-500",
    description:
      "Chịu trách nhiệm thiết kế kiến trúc hệ thống và trực tiếp triển khai thực tế 50+ giao diện Next.js tối ưu. Xây dựng lõi Backend dựa trên mô hình Clean Architecture, tích hợp cơ chế Idempotency Control và Distributed Rate Limiting qua Redis nhằm đảm bảo tính toàn vẹn dữ liệu và khả năng chịu tải của hệ thống.",
    tags: ["Core Architecture", "Next.js Expert", "Backend Optimization"],
    stats: "Full-cycle Implementation",
  },
  {
    name: "Phạm Hoàng Bảo Ngọc",
    role: "System Analyst & Documentation Specialist",
    avatar: "N",
    gradient: "from-purple-600 to-rose-500",
    description:
      "Kiến trúc sư giải pháp tập trung vào mô hình hóa nghiệp vụ thông qua phân tích OOAD và hệ thống State Machine phức tạp. Quản lý quy trình kiểm thử hệ thống (System Testing), đặc tả chi tiết các luồng logic APIs và đảm bảo tính nhất quán giữa tài liệu kiến trúc và triển khai thực tế.",
    tags: ["System Modeling", "Business Logic", "Quality Assurance"],
    stats: "Architecture & QA Design",
  },
];
