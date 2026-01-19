export const TOPIC = {
  DROPDOWN: "Chủ đề",
};

export const TOPIC_LIST = {
  TITLE: "Danh sách Chủ đề",
  TOTAL_TOPICS: (count: number) => `Tổng số Chủ đề (${count})`,
  BUTTON_NEW: "Tạo Chủ đề mới",
};

export const TOPIC_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Đang chờ duyệt", value: "pending" },
  { label: "Đã phê duyệt", value: "approved" },
  { label: "Bị từ chối", value: "rejected" },
];

// Dùng chung cho việc hiển thị nhãn trạng thái
export const TOPIC_STATUS_LABELS = [
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đã xuất bản", value: "approved" },
  { label: "Bị từ chối", value: "rejected" },
];
