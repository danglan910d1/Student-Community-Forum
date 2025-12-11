// src/components/ui/ActionItem.tsx

import { forwardRef, ReactNode } from "react";

// Định nghĩa các biến thể (variants).
type ActionItemVariant = "default";

interface ActionItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  variant?: ActionItemVariant;
}

// --- STYLE MAPS ---

// Ánh xạ Màu Icon (Foreground) cho trạng thái Active/Inactive
const actionItemIconStyles: Record<
  ActionItemVariant,
  { active: string; inactive: string }
> = {
  default: {
    // Icon Active (Post): Xanh đậm (nav-bg)
    active: "text-nav-bg",
    // Icon Inactive (Topics): Xanh đậm (nav-bg)
    inactive: "text-nav-bg",
  },
};

// Ánh xạ Nền Icon (Icon Background) cho trạng thái Active/Inactive
const actionIconBackgroundStyles: Record<
  ActionItemVariant,
  { active: string; inactive: string }
> = {
  default: {
    // Icon Active: Xanh lá nhạt (bg-green-100)
    active: "bg-green-100",
    // Icon Inactive: Vàng/Cam nhạt (bg-yellow-100)
    inactive: "bg-yellow-100",
  },
};

// Ánh xạ Style nền/hover/bóng cho Button Wrapper (Màu nền trắng trong hình mẫu)
const actionItemBaseStateStyles: Record<
  ActionItemVariant,
  { active: string; inactive: string }
> = {
  default: {
    // Trạng thái Active: Nền TRẮNG, KHÔNG CÓ BÓNG, Text xanh đậm
    active: "bg-white text-text-title shadow-none",
    // Trạng thái Inactive: Nền TRẮNG, hover nhẹ, Text xanh đậm
    inactive: "bg-white text-text-title hover:bg-highlight/50 shadow-none",
  },
};

// --- COMPONENT ---

const ActionItem = forwardRef<HTMLButtonElement, ActionItemProps>(
  (
    {
      icon,
      label,
      isActive = false,
      variant = "default",
      className = "",
      ...props
    },
    ref
  ) => {
    // 1. Lấy style nền/trạng thái (active/inactive) cho Button
    const currentStyle = isActive
      ? actionItemBaseStateStyles[variant]?.active ||
        actionItemBaseStateStyles.default.active
      : actionItemBaseStateStyles[variant]?.inactive ||
        actionItemBaseStateStyles.default.inactive;

    // 2. Lấy style Icon Foreground
    const iconStyle = isActive
      ? actionItemIconStyles[variant]?.active ||
        actionItemIconStyles.default.active
      : actionItemIconStyles[variant]?.inactive ||
        actionItemIconStyles.default.inactive;

    // 3. Lấy style Icon Background
    const iconBgStyle = isActive
      ? actionIconBackgroundStyles[variant]?.active ||
        actionIconBackgroundStyles.default.active
      : actionIconBackgroundStyles[variant]?.inactive ||
        actionIconBackgroundStyles.default.inactive;

    // Base classes chung cho mọi ActionItem (Bo góc, padding, flex, transition)
    const commonClasses =
      "flex items-center space-x-3 p-3 rounded-lg w-full transition duration-150 cursor-pointer";

    return (
      <button
        ref={ref}
        className={`${commonClasses} ${currentStyle} ${className}`}
        {...props}
      >
        {/* Container cho Icon: Thêm nền icon và bo góc cho icon */}
        <div
          className={`
            flex items-center justify-center 
            w-8 h-8 rounded-lg 
            flex-shrink-0 
            ${iconBgStyle} 
            ${iconStyle}
          `}
        >
          {icon}
        </div>

        {/* Text Label */}
        <span className={`text-base font-medium whitespace-nowrap`}>
          {label}
        </span>
      </button>
    );
  }
);

ActionItem.displayName = "ActionItem";

export default ActionItem;
