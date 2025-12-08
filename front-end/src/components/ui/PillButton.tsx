// src/components/ui/PillButton.tsx

import { forwardRef, ReactNode } from "react";

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isActive?: boolean; // Trạng thái active/được chọn
  className?: string;
}

// Sử dụng forwardRef để component này có thể được sử dụng trong các form
const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ children, isActive = false, className = '', ...props }, ref) => {
    
    // Base style áp dụng chung cho tất cả PillButton
    const baseStyle = 'py-1.5 px-4 text-sm font-medium rounded-full transition duration-150 whitespace-nowrap';
    
    // Style cho trạng thái Active (Được chọn)
    const activeStyle = 'bg-nav-bg text-text-light shadow-sm';
    
    // Style cho trạng thái Inactive (Không chọn)
    const inactiveStyle = 'bg-white text-text-title border border-highlight hover:bg-highlight/50';

    // Quyết định style dựa trên isActive
    const currentStyle = isActive ? activeStyle : inactiveStyle;

    return (
      <button 
        ref={ref}
        // Áp dụng base style, sau đó là style hiện tại, cuối cùng là class tùy chỉnh
        className={`${baseStyle} ${currentStyle} ${className} cursor-pointer`} 
        {...props}
      >
        {children}
      </button>
    );
  }
);

PillButton.displayName = 'PillButton';

export default PillButton;