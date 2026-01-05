/**
 * Hàm sắp xếp mảng đối tượng theo một field chuỗi bất kỳ (hỗ trợ tiếng Việt)
 */
export const sortByAlphabet = <T>(data: T[], key: keyof T): T[] => {
  return [...data].sort((a, b) => {
    const valA = String(a[key] ?? "");
    const valB = String(b[key] ?? "");
    return valA.localeCompare(valB, "vi");
  });
};

export function getInitials(
  name?: string,
  options?: {
    maxLength?: number;
    fallback?: string;
  }
) {
  const maxLength = options?.maxLength ?? 2;
  const fallback = options?.fallback ?? "U";

  if (!name) return fallback;

  const initials = name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return initials.slice(0, maxLength) || fallback;
}
