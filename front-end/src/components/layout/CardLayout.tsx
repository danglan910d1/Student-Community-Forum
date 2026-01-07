import { cn } from "@/lib/utils";

interface CardLayoutProps extends React.ComponentProps<"div"> {
  // Bạn có thể thêm các option nhỏ để tùy biến nhanh
  withHover?: boolean;
}

export function CardLayout({
  children,
  className,
  withHover = false,
  ...props
}: CardLayoutProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-lg border shadow-sm p-2 border-1 flex flex-col min-h-0",
        "transition-all duration-200", // color-card transition
        // Nếu muốn dùng hiệu ứng nổi khi hover như các ô màu
        withHover &&
          "hover:opacity-95 hover:shadow-hover-default-shadow cursor-pointer",

        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
