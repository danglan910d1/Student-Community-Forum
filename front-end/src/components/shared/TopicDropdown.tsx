"use client";
import { GenericDropdown } from "./GenericDropdown";

const TOPICS = [
  "Lập trình Web",
  "Trí tuệ nhân tạo",
  "An toàn thông tin",
  "Mobile App",
  "Dữ liệu lớn",
];

export const TopicDropdown = () => (
  <GenericDropdown
    label="Chủ đề"
    items={TOPICS}
    onSelect={(val) => console.log("Lọc theo chủ đề:", val)}
  />
);
