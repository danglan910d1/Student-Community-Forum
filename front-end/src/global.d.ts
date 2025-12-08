// global.d.ts hoặc styles.d.ts

declare module "*.css" {
  // Hoặc dùng type any nếu bạn không cần kiểu trả về cụ thể cho module CSS
  const content: { [className: string]: string };
  export default content;
}

// Nếu bạn chỉ import side-effect (không lấy nội dung module) như trong file layout.tsx
// thì khai báo đơn giản này là đủ:
// declare module '*.css';
