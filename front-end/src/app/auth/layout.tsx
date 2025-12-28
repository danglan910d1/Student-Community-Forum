// app/(main)/page.tsx
import { AuthLayout } from "@/modules/auth/components/shared/AuthLayout";

// Hàm giả lập thời gian load dữ liệu 2 giây
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default async function Page({
  children,
}: {
  children: React.ReactNode;
}) {
  // Khi có dòng này, Next.js sẽ hiện loading.tsx trong đúng 2 giây
  await delay(1000);

  return <AuthLayout>{children}</AuthLayout>;
}
