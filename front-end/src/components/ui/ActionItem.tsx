// src/components/ui/ActionItem.tsx

import { forwardRef, ReactNode } from 'react';

interface ActionItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode; // Icon hoặc SVG component
  label: string;
  isActive?: boolean;
}

const ActionItem = forwardRef<HTMLButtonElement, ActionItemProps>(
  ({ icon, label, isActive = false, className = '', ...props }, ref) => {
    
    // Style cho trạng thái Active (Mục đang được chọn - Post trong hình mẫu)
    // Nền highlight/xám nhẹ, KHÔNG CÓ BÓNG để phù hợp với hình mẫu này
    const activeStyle = 'bg-highlight text-text-title shadow-none'; 
    
    // Style cho trạng thái Inactive (Mục không được chọn - Topics trong hình mẫu)
    // Nền trắng, có bóng nhẹ ở khối bao ngoài, hover nhẹ
    const inactiveStyle = 'bg-white text-text-title hover:bg-highlight/50 shadow-none';

    const currentStyle = isActive ? activeStyle : inactiveStyle;

    // Màu Icon:
    // Nếu Active (Post) => Icon màu xanh đậm (nav-bg)
    // Nếu Inactive (Topics) => Icon màu Cam/Nâu (icon-color)
    const iconStyle = isActive ? 'text-nav-bg' : 'text-icon-color';
    
    // Đảm bảo Text màu xanh đậm (text-text-title) trong cả hai trạng thái
    const textStyle = 'text-text-title'; 

    return (
      <button
        ref={ref}
        // Bo góc nhẹ hơn (rounded-lg) và Transition
        className={`flex items-center space-x-3 p-3 rounded-lg w-full transition duration-150 cursor-pointer ${currentStyle} ${className}`}
        {...props}
      >
        {/* Container cho Icon */}
        <div className={`flex-shrink-0 w-5 h-5 ${iconStyle}`}>
          {icon}
        </div>
        
        {/* Text Label */}
        <span className={`text-base font-medium whitespace-nowrap ${textStyle}`}>
          {label}
        </span>
      </button>
    );
  }
);

ActionItem.displayName = 'ActionItem';

export default ActionItem;