// import React from "react";
// import { Loader2 } from "lucide-react";
// import { Variant, Size } from "@/types/comon";
// import { baseStyles, variantStyles, sizeStyles } from "@/styles/common";

// interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: Variant;
//   size?: Size;
//   isLoading?: boolean;
//   leftIcon?: React.ReactNode;
//   rightIcon?: React.ReactNode;
// }

// const Button: React.FC<ButtonProps> = ({
//   children,
//   variant = "primary",
//   size = "md",
//   isLoading = false,
//   leftIcon,
//   rightIcon,
//   className = "",
//   disabled,
//   ...props
// }) => {
//   const currentVariant = variantStyles[variant];
//   const currentSize = sizeStyles[size];

//   return (
//     <button
//       className={`${baseStyles} ${currentVariant} ${currentSize} ${className}`}
//       disabled={disabled || isLoading}
//       {...props}
//     >
//       {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

//       {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}

//       {children}

//       {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
//     </button>
//   );
// };

// export default Button;

// custom-button.tsx (Component Tùy chỉnh)

import * as React from "react";
// Import các thứ cần thiết từ file base
import { Button, ButtonProps } from "./button";
// Icon
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// --------------------------------------------------------------------------
// I. MỞ RỘNG PROPS
// --------------------------------------------------------------------------

// Omit các props của Button base mà chúng ta muốn định nghĩa lại/ghi đè (nếu cần)
interface CustomButtonProps extends Omit<ButtonProps, "children"> {
  // Thêm các props tùy chỉnh
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

// --------------------------------------------------------------------------
// II. CUSTOM BUTTON COMPONENT
// --------------------------------------------------------------------------

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  (
    {
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled, // Bắt disabled để kết hợp với isLoading
      ...props
    },
    ref
  ) => {
    // Nội dung hiển thị bên trong nút
    const content = (
      <>
        {/* 1. Icon Loading */}
        {isLoading && (
          <Loader2 className={cn("size-4 animate-spin", !children && "m-0")} />
        )}

        {/* 2. Left Icon (Hiển thị khi không loading) */}
        {!isLoading && leftIcon}

        {/* 3. Nội dung chính (children) */}
        {children}

        {/* 4. Right Icon (Hiển thị khi không loading) */}
        {!isLoading && rightIcon}
      </>
    );

    return (
      <Button
        // Tự động disable khi đang loading
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {content}
      </Button>
    );
  }
);

CustomButton.displayName = "CustomButton";

export default CustomButton;
