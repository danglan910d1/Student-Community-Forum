import { forwardRef, ReactNode } from "react";


// Định nghĩa các kiểu nút
type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}


// 1. DÙNG OBJECT LOOKUP ĐỂ ÁNH XẠ VARIANT SANG CHUỖI CSS
const variantStyles: Record<ButtonVariant, string> = {
 
  // Nút 'New Post': Kích thước nhỏ hơn, bo góc vừa phải (rounded-lg), bóng nhẹ hơn (shadow-md)
  primary: 'bg-nav-bg text-text-light hover:bg-btn-hover shadow-md',
 
  // Nút 'Tag/Accent' (ví dụ: Nút hành động nổi bật): giữ nguyên style nổi bật
  accent: 'bg-icon-color text-text-light hover:bg-[#d47639] shadow-md',
 
  // Nút Lọc (ví dụ: 'Mới nhất', 'Phổ biến'): KHÔNG VIỀN, chỉ có nền trắng, hover nhẹ
  // Lưu ý: 'Mới nhất' khi được chọn cần xử lý state active bên ngoài component này.
  secondary: 'bg-white text-text-title hover:bg-highlight/50 shadow-none',
 
  // Nút Ghost: Dùng cho các nút không màu nền, text đậm
  ghost: 'bg-transparent text-text-title hover:bg-highlight/50 shadow-none',
};


// 2. Component sử dụng ForwardRef
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', className = '', ...props }, ref) => {
   
    // Base style áp dụng cho tất cả các nút
    // Điều chỉnh Padding và Text Size xuống `text-sm` hoặc `text-base`
    const baseStyle = ' py-2 px-4 text-white font-medium rounded-lg text-base transition duration-150 shadow-lg';
   
    // Lấy chuỗi style dựa trên variant
    const variantStyle = variantStyles[variant] || variantStyles.primary;


    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variantStyle} ${className} cursor-pointer`}
        {...props}
        disabled={props.disabled}
      >
        {children}
      </button>
    );
  }
);


Button.displayName = 'Button';


export default Button;