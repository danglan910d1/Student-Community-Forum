import { SignupContainer } from "@/modules/auth/containers/SignUpContainer";
import { AUTH_TEXT } from "@/modules/auth/constant/authText";
import { COMMON } from "@/constants/commom";

export const metadata = {
  title: AUTH_TEXT.SIGNUP.PAGE_TITLE,
  description: COMMON.PAGE_DES,
};

async function DelayedContent() {
  // Chỉ trễ đúng 800ms - đủ để thấy Skeleton mượt mà mà không gây khó chịu
  await new Promise((resolve) => setTimeout(resolve, 300));
  return <SignupContainer />;
}

export default function RegisterPage() {
  return <DelayedContent />;
}
