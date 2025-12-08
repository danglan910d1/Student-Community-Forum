// src/components/ui/Chip.tsx (Hoặc share/ui/Chip.tsx)

import { ReactNode } from 'react';

// Định nghĩa các kiểu Chip cần thiết dựa trên hình mẫu
type ChipVariant = 'default' | 'performance' | 'tech' | 'highlight';

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  className?: string;
}

// Ánh xạ các biến thể sang Tailwind classes (Sử dụng màu từ config)
const chipStyles: Record<ChipVariant, string> = {
  // Tech/React/AI: Nền xanh nhạt, Text xanh đậm (nav-bg)
  // Sử dụng các màu custom vừa định nghĩa ở trên (tag-tech-...)
  tech: 'bg-tag-tech-bg text-tag-tech-text', 
  
  // Performance: Nền hồng nhạt, Text cam/icon-color
  performance: 'bg-tag-performance-bg text-tag-performance-text', 
  
  // Highlight (ví dụ: Đồ án, Nhóm): Nền highlight nhẹ, Text đậm
  highlight: 'bg-highlight/50 text-text-title', 
  
  // Mặc định (default): Nền xám nhạt (highlight) và text-title
  default: 'bg-highlight text-text-title',
};

export default function Chip({ children, variant = 'default', className = '' }: ChipProps) {
const baseStyle = 'inline-flex items-center text-xs font-medium rounded-full py-0.5 px-2 transition duration-150 whitespace-nowrap';
const variantStyle = chipStyles[variant] || chipStyles.default;

  return (
    <span className={`${baseStyle} ${variantStyle} ${className}`}>
      {children}
    </span>
  );
}

// Lưu ý: Bạn cần thêm màu 'bg-yellow-100', 'bg-blue-100', 'bg-purple-100' vào tailwind.config.js