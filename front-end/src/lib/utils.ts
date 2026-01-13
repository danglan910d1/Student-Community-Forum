import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// src/lib/utils.ts hoặc nơi phù hợp
export const getAssetUrl = (path: string | null | undefined): string => {
  if (!path) return "";

  // Nếu path đã có sẵn http (dữ liệu cũ còn sót lại), thay port
  if (path.startsWith("http")) {
    return path.replace("localhost:3000", "localhost:5000");
  }

  // Nếu path là path tương đối (/uploads/...), nối với URL Backend 5000
  // NEXT_PUBLIC_API_URL của bạn là http://localhost:5000/api
  // Chúng ta cần lấy http://localhost:5000
  const backendBase = "http://localhost:5000";

  return `${backendBase}${path.startsWith("/") ? "" : "/"}${path}`;
};
