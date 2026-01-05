import { LoginContainer } from "@/modules/auth/containers/LoginContainer";
import { COMMON } from "@/constants/commom";
import { AUTH_TEXT } from "@/modules/auth/constant/authText";

export const metadata = {
  title: AUTH_TEXT.LOGIN.PAGE_TITLE,
  description: COMMON.PAGE_DES,
};

async function DelayedContent() {
  // Chỉ trễ đúng 800ms - đủ để thấy Skeleton mượt mà mà không gây khó chịu
  await new Promise((resolve) => setTimeout(resolve, 300));
  return <LoginContainer />;
}

export default function LoginPage() {
  return <DelayedContent />;
}
