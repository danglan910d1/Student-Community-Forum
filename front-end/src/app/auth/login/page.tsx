import { LoginContainer } from "@/modules/auth/containers/LoginContainer";

export const metadata = {
  title: "Đăng nhập - Diễn đàn CNTT",
  description:
    "Tham gia cộng đồng chia sẻ kiến thức công nghệ lớn nhất Việt Nam",
};

async function DelayedContent() {
  // Chỉ trễ đúng 800ms - đủ để thấy Skeleton mượt mà mà không gây khó chịu
  await new Promise((resolve) => setTimeout(resolve, 300));
  return <LoginContainer />;
}

export default function LoginPage() {
  return <DelayedContent />;
}
