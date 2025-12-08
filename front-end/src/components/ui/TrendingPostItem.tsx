// src/components/ui/TrendingPostItem.tsx

import { ReactNode } from 'react';
import { Flame, Dot } from 'lucide-react'; 

interface TrendingPostItemProps {
  title: string;
  author: string;
  details: string; // Ví dụ: 250 lượt xem
  tags?: string; // Ví dụ: Tag: #React, #CSS | 15 bình luận
  isTop?: boolean; // Nếu là bài viết nổi bật nhất (Top 1)
  icon?: ReactNode; // Icon tùy chỉnh (nếu có)
  className?: string;
}

export default function TrendingPostItem({ 
  title, 
  author, 
  details, 
  tags, 
  isTop = false, 
  icon, 
  className = '' 
}: TrendingPostItemProps) {
  
  // Màu chủ đạo cho Top Post là màu đỏ (red-500)
  const topColor = isTop ? 'text-red-600' : 'text-text-title';
  const iconContainerStyle = isTop ? 'text-red-600' : 'text-red-400';

  return (
    <div className={`flex space-x-2 p-3 hover:bg-highlight/50 transition duration-150 cursor-pointer ${className}`}>
      
      {/* 1. Icon/Chấm nổi bật */}
      <div className={`flex-shrink-0 pt-1 ${iconContainerStyle}`}>
        {isTop ? (
          // Top 1: Icon ngọn lửa (Flame)
          <Flame className="w-5 h-5 fill-current" />
        ) : (
          // Các mục khác: Chấm tròn (Dot)
          <Dot className="w-6 h-6" /> 
        )}
      </div>

      {/* 2. Nội dung Text */}
      <div className="flex flex-col">
        {/* Tiêu đề */}
        <h4 className={`text-base font-semibold leading-snug ${topColor}`}>
          {title}
        </h4>
        
        {/* Tác giả & Chi tiết */}
        <p className="text-sm text-text-title/70 mt-0.5">
          <span className="font-medium">Đăng bởi: {author}</span> 
          <span className="mx-1">•</span>
          <span>{details}</span>
        </p>
        
        {/* Tags và Bình luận */}
        {tags && (
          <p className="text-xs text-text-title/50 mt-1">
            {tags}
          </p>
        )}
      </div>
    </div>
  );
}