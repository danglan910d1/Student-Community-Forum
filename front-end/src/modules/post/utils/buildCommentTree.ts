import { IComment } from "../types";

/**
 * Biến mảng bình luận phẳng thành cấu trúc cây lồng nhau.
 * Hỗ trợ độ sâu vô tận (infinite nesting).
 */
export const buildCommentTree = (list: IComment[]): IComment[] => {
  // 1. Khởi tạo Map với kiểu dữ liệu rõ ràng
  // Chúng ta sử dụng IComment & { replies: IComment[] } để đảm bảo
  // mỗi item trong map luôn có mảng replies dù ban đầu list có hay không.
  const map: Record<string, IComment & { replies: IComment[] }> = {};
  const roots: IComment[] = [];

  // 2. Bước 1: Duyệt mảng để đưa tất cả item vào Map
  list.forEach((item) => {
    map[item.commentId] = {
      ...item,
      // Đảm bảo ghi đè hoặc khởi tạo replies là mảng rỗng
      replies: [],
    };
  });

  // 3. Bước 2: Xây dựng mối quan hệ cha-con
  list.forEach((item) => {
    const node = map[item.commentId];

    if (item.parentId && map[item.parentId]) {
      // Nếu item có parentId và parentId đó tồn tại trong Map
      map[item.parentId].replies.push(node);
    } else if (!item.parentId) {
      // Nếu không có parentId, đây là bình luận cấp cao nhất (Root)
      roots.push(node);
    }
    // Trường hợp item có parentId nhưng cha không tồn tại trong list
    // (do phân trang hoặc lỗi dữ liệu), item đó sẽ tạm thời bị ẩn
    // để tránh làm vỡ logic hiển thị.
  });

  return roots;
};
