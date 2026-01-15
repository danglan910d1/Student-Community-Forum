export const POST_LIST = {
  TITLE: "Danh sách Bài viết",
  TOTAL_POSTS: (count: number) => `Tổng số bài Post (${count})`,
  TABS: {
    LATEST: "Mới nhất",
    POPULAR: "Phổ biến",
    SOLVED: "Đã Giải quyết",
  },
  BUTTON_NEW: "New Post",
};

export const POST_FILTERS = [
  { label: "Mới nhất", value: "new" },
  { label: "Phổ biến", value: "popular" },
  { label: "Đã Giải quyết", value: "resolved" },
];

export const MY_POST_FILTERS = [
  { label: "Tất cả bài viết", value: "all" },
  { label: "Đang chờ duyệt", value: "pending" },
  { label: "Đã xuất bản", value: "approved" },
  { label: "Bị từ chối", value: "rejected" },
];
