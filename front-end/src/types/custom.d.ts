// src/types/custom.d.ts

declare module '*.css' {
  // Báo cho TypeScript biết rằng bất kỳ import nào kết thúc bằng .css
  // đều hợp lệ và không cần có định nghĩa kiểu cụ thể.
  // Dùng type any hoặc type module definition rỗng (như dưới đây)
  const content: [];
  export default content;
}
