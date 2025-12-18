// global.d.ts hoặc styles.d.ts

declare module "*.css" {
  // Hoặc dùng type any nếu không cần kiểu trả về cụ thể cho module CSS
  const content: { [className: string]: string };
  export default content;
}
