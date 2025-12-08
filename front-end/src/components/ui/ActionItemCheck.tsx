// src/components/ui/ActionItemCheck.tsx (Đã đổi tên và di chuyển)

import { forwardRef, ReactNode } from 'react';

interface ActionItemCheckProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode; // Icon hoặc SVG component
  label: string;
  isActive?: boolean;
}

const ActionItemCheck = forwardRef<HTMLButtonElement, ActionItemCheckProps>(
  ({ icon, label, isActive = false, className = '', ...props }, ref) => {
    
    // Style cho trạng thái Active (Nền trắng, Bóng nhẹ, Text màu đậm)
    const activeStyle = 'bg-white shadow-md text-text-title'; 
    
    // Style cho trạng thái Inactive (Nền trong suốt, Text mờ, Hover có nền xám nhẹ)
    const inactiveStyle = 'bg-transparent text-text-title/80 hover:bg-highlight/50';

    const currentStyle = isActive ? activeStyle : inactiveStyle;

    // Màu Icon: Icon nổi bật (icon-color) khi active, hoặc xám nhẹ khi inactive
    // Điều chỉnh độ mờ của icon inactive
    const iconStyle = isActive ? 'text-icon-color' : 'text-text-title/70';

    return (
      <button
        ref={ref}
        className={`flex items-center space-x-3 p-3 rounded-lg w-full transition duration-150 cursor-pointer ${currentStyle} ${className}`}
        {...props}
      >
        {/* Container cho Icon, Icon có màu cam (icon-color) khi active */}
        <div className={`flex-shrink-0 w-5 h-5 ${iconStyle}`}>
          {icon}
        </div>
        
        {/* Text Label */}
        <span className="text-base font-medium whitespace-nowrap">
          {label}
        </span>
      </button>
    );
  }
);

ActionItemCheck.displayName = 'ActionItemCheck';

export default ActionItemCheck;