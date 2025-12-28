"use client";
import { cn } from "@/lib/utils";
import { CenteredContainer } from "@/components/layout/CenteredContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import AuthSkeleton from "./AuthSkeleton";
import { usePathname } from "next/navigation";

interface AuthLayoutProps extends React.ComponentProps<"div"> {
  imageSrc?: string;
}

export function AuthLayout({
  className,
  children,
  imageSrc = "/images/placeholder.svg",
  ...props
}: AuthLayoutProps) {
  const pathname = usePathname();
  return (
    <CenteredContainer>
      <Card className={cn("overflow-hidden p-0", className)} {...props}>
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Cột trái: Nội dung Form */}
          <div className="p-6 md:p-8">
            <Suspense fallback={<AuthSkeleton />} key={pathname}>
              {children}
            </Suspense>
          </div>

          {/* Cột phải: Hình ảnh có thể thay đổi */}
          <div className="bg-muted relative hidden md:block">
            <img
              src={imageSrc}
              alt="Auth Background"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      {/* Phần chân trang dùng chung cho mọi trang Auth */}
      {/* <FieldDescription className="px-6 text-center mt-4">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </FieldDescription> */}
    </CenteredContainer>
  );
}
