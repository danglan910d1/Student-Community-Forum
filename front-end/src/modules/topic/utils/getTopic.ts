import { sortByAlphabet } from "@/utils/string";
import { ITopic } from "../types";

// Tái sử dụng hàm sắp xếp chung để phục vụ mục đích riêng của Topic
export const getSortedTopicItems = (topics: ITopic[]) => {
  const sorted = sortByAlphabet(topics, "name");
  return sorted.map((t) => ({
    label: t.name,
    value: t.slug,
  }));
};

export const getTopicDisplayLabel = (
  topics: ITopic[],
  currentSlug: string | null,
  isLoading: boolean,
  hasHydrated: boolean
) => {
  if (isLoading && !hasHydrated) return "Đang tải...";
  const activeTopic = topics.find((t) => t.slug === currentSlug);
  return activeTopic ? activeTopic.name : "Chủ đề";
};
