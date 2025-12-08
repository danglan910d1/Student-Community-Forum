// src/components/ui/TagItem.tsx

import { ReactNode } from 'react';

interface TagItemProps {
  icon: ReactNode; // Icon hoặc SVG component (ví dụ: <Code /> cho Javascript)
  label: string; // Ví dụ: javascript
  count: number; // Số lượng bài đăng
  status?: string; // Ví dụ: Đang thịnh hành
  borderColor: string; // Màu border dọc (ví dụ: 'border-yellow-500')
  className?: string;
}

export default function TagItem({ 
  icon, 
  label, 
  count, 
  status, 
  borderColor, 
  className = '' 
}: TagItemProps) {
  
  // Style cho đường viền dọc (Active/Thịnh hành)
  // Sử dụng Tailwind để tạo viền bên trái (border-l-4) và áp dụng màu
  const borderStyle = status ? `border-l-4 ${borderColor}` : 'border-l-4 border-transparent';
  
  return (
    <div className={`p-3 bg-white hover:bg-highlight/50 transition duration-150 cursor-pointer ${borderStyle} ${className}`}>
      <div className="flex items-center space-x-2 mb-1">
        {/* Icon: Có màu tương ứng với border */}
        <div className={`w-5 h-5 flex-shrink-0 ${borderColor}`}>
          {icon}
        </div>
        
        {/* Label (#javascript) */}
        <span className="text-text-title text-base font-semibold">
          #{label}
        </span>
      </div>
      
      {/* Số liệu và Trạng thái */}
      <div className="text-sm text-text-title/70 pl-7"> 
        {/* Dùng pl-7 để căn chỉnh số liệu với text label */}
        <span>{count.toLocaleString()} bài đăng</span>
        {status && (
          // Thêm dấu chấm và trạng thái (Đang thịnh hành)
          <span className="ml-2 font-medium">| {status}</span>
        )}
      </div>
    </div>
  );
}

// // src/components/ui/TagItem.tsx

// import { ReactNode } from 'react';

// interface TagItemProps {
//   icon: ReactNode; 
//   label: string; 
//   count: number; 
//   status?: string; // Ví dụ: Đang thịnh hành
//   highlightColor: string; // Màu cho đường viền phải (Ví dụ: 'border-yellow-500')
//   iconBgColor: string; // Màu nền cho icon (Ví dụ: 'bg-blue-100')
//   iconColor: string; // Màu của icon (Ví dụ: 'text-blue-600')
//   className?: string;
// }

// export default function TagItem({ 
//   icon, 
//   label, 
//   count, 
//   status, 
//   highlightColor, 
//   iconBgColor,
//   iconColor,
//   className = '' 
// }: TagItemProps) {
//   
//   // Style cho đường viền nổi bật bên phải (Highlight)
//   // Trong hình mẫu, đường viền này rất mỏng và nằm sát bên phải
//   const highlightStyle = status ? `border-r-2 ${highlightColor}` : 'border-r-2 border-transparent';
//   
//   return (
//     <div className={`p-3 bg-white hover:bg-highlight/50 transition duration-150 cursor-pointer flex justify-between items-center ${highlightStyle} ${className}`}>
      
//       {/* 1. Khối trái (Icon, Label, Count) */}
//       <div className="flex flex-col">
        
//         {/* Hàng 1: Icon và Label */}
//         <div className="flex items-center space-x-2 mb-1">
//           {/* Icon (Vòng tròn nền màu) */}
//           <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-text-light" 
//                 // Áp dụng màu nền và màu icon
//                 style={{ backgroundColor: iconBgColor, color: iconColor }}> 
//             {/* Icon bên trong */}
//             <div className={`w-5 h-5 ${iconColor}`}>{icon}</div>
//           </div>
//           
//           {/* Label (#javascript) */}
//           <span className="text-text-title text-base font-semibold">
//             #{label}
//           </span>
//         </div>
//         
//         {/* Hàng 2: Số liệu và Trạng thái */}
//         <div className="text-sm text-text-title/70 pl-10"> 
//           <span>{count.toLocaleString()} bài đăng</span>
//           {status && (
//             // Trạng thái 'Đang thịnh hành' phải có màu xanh lá (text-green-600)
//             <span className="ml-2 font-medium text-green-600">
//               • {status}
//             </span>
//           )}
//         </div>
//       </div>
      
//       {/* 2. Khối phải (Viền Highlight) - Được xử lý bằng border-r-2 ở khối cha */}
//     </div>
//   );
// }