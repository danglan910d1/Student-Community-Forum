/**
 * Hàm tách số đầu tiên tìm thấy trong một chuỗi
 * Ví dụ: "120 Views | 30 Comments" -> 120
 * "35 Votes | 15 Trả lời" -> 35
 */
export const getFirstNumber = (statsStr: string): number => {
  const match = statsStr.match(/\d+/); // Tìm nhóm chữ số đầu tiên
  return match ? parseInt(match[0], 10) : 0;
};
