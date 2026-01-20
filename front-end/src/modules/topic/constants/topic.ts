export const TOPIC = {
  DROPDOWN: "Chủ đề",
};

export const TOPIC_LIST = {
  TITLE: "Danh sách Chủ đề",
  TOTAL_TOPICS: (count: number) => `Tổng số Chủ đề (${count})`,
  BUTTON_NEW: "Tạo Chủ đề mới",
};

// Dùng chung cho việc hiển thị nhãn trạng thái
export const TOPIC_STATUS_LABELS = [
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đã xuất bản", value: "approved" },
  { label: "Bị từ chối", value: "rejected" },
];
export const TAXONOMY_SORT_OPTIONS = [
  { label: "Mới nhất", value: "new" },
  { label: "Phổ biến", value: "popular" },
  { label: "Cũ nhất", value: "old" },
];
