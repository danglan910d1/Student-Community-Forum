// app/(main)/page.tsx
import { MainSection } from "@/components/shared/PostSection";
import { Suspense } from "react";

// Hàm giả lập thời gian load dữ liệu 2 giây
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default async function Page() {
  // Khi có dòng này, Next.js sẽ hiện loading.tsx trong đúng 2 giây
  await delay(500);

  return <MainSection />;
}
