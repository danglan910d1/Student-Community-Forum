// src/components/ui/Avatar.tsx

import Image from 'next/image';
import { ReactNode } from 'react';

// Định nghĩa các kích thước
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string; // URL ảnh đại diện
  alt: string; // Tên người dùng (dùng cho alt và fallback)
  size?: AvatarSize;
  isOnline?: boolean; // Hiển thị chấm trạng thái online
  className?: string;
  hasRing?: boolean; // Bật viền trắng bên ngoài (dùng cho User Status)
}

// Ánh xạ kích thước sang Tailwind classes
const sizeMap: Record<AvatarSize, { container: string; fallbackText: string; ringSize: string }> = {
  sm: { container: 'w-6 h-6', fallbackText: 'text-xs', ringSize: 'ring-1' }, 
  md: { container: 'w-8 h-8', fallbackText: 'text-sm', ringSize: 'ring-2' }, 
  lg: { container: 'w-12 h-12', fallbackText: 'text-lg', ringSize: 'ring-4' }, // Kích thước lớn, ring dày hơn
  xl: { container: 'w-16 h-16', fallbackText: 'text-xl', ringSize: 'ring-4' }, 
};

export default function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  isOnline = false, 
  className = '',
  hasRing = false 
}: AvatarProps) {
  
  const { container, fallbackText, ringSize } = sizeMap[size];
  
  // Lấy chữ cái đầu tiên (Fallback logic)
  const initial = alt ? alt.charAt(0).toUpperCase() : '?';

  // Định nghĩa style cho viền ngoài
  // Chúng ta sẽ đặt ring-white ngay trên container chính để tạo hiệu ứng viền dày, sát.
  const ringStyle = hasRing ? `${ringSize} ring-white` : ''; 

  // Kích thước chấm online
  const statusSize = size === 'lg' || size === 'xl' ? 'w-3 h-3' : 'w-2.5 h-2.5';

  return (
    <div 
      className={`relative ${container} rounded-full flex-shrink-0 ${className} ${ringStyle}`}
      title={alt}
    >
      
      {/* Container bên trong (để ẩn overflow và đặt nội dung/ảnh) */}
      <div className="w-full h-full rounded-full overflow-hidden">
        
        {src ? (
          // A. Hình ảnh Avatar (Nếu có src)
          <Image
            src={src}
            alt={alt}
            fill // Dùng 'fill' thay vì 'layout="fill"' cho Next.js 13+
            style={{ objectFit: 'cover' }}
          />
        ) : (
          // B. Fallback/Default (NỀN XANH DƯƠNG - bg-btn-accent)
          <div 
            className={`w-full h-full flex items-center justify-center bg-btn-accent text-text-light font-semibold ${fallbackText}`}
          >
            {initial}
          </div>
        )}
      </div>

      {/* 2. Status Online Dot (Chấm xanh lá) */}
      {isOnline && (
        <span 
          className={`absolute bottom-0 right-0 block ${statusSize} 
                      rounded-full ring-2 ring-white bg-green-500`}
          title="Online"
        />
      )}
    </div>
  );
}