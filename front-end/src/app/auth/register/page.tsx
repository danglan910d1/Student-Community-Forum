import { SignupContainer } from "@/modules/auth/containers/SignUpContainer";

export const metadata = {
  title: "Đăng ký tài khoản - Diễn đàn CNTT",
  description:
    "Tham gia cộng đồng chia sẻ kiến thức công nghệ lớn nhất Việt Nam",
};

async function DelayedContent() {
  // Chỉ trễ đúng 800ms - đủ để thấy Skeleton mượt mà mà không gây khó chịu
  await new Promise((resolve) => setTimeout(resolve, 300));
  return <SignupContainer />;
}

export default function RegisterPage() {
  return <DelayedContent />;
}
