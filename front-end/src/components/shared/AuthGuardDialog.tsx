"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

export interface AuthGuardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function AuthGuardDialog({
  isOpen,
  onOpenChange,
  title = "Yêu cầu đăng nhập",
  description = "Vui lòng đăng nhập để thực hiện tính năng này và trải nghiệm đầy đủ các tiện ích.",
}: AuthGuardDialogProps) {
  const router = useRouter();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[360px] rounded-3xl p-8">
        <AlertDialogHeader className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <LockKeyhole className="h-8 w-8 text-foreground" />
          </div>
          <div className="w-full space-y-2 text-center">
            <AlertDialogTitle className="text-2xl font-bold tracking-tight">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col sm:flex-col gap-2 mt-4">
          <Button
            className="w-full rounded-xl h-12 text-base font-bold"
            onClick={() => router.push("/auth/login")}
          >
            Đăng nhập
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl h-12 text-base font-bold border-none"
            onClick={() => router.push("/auth/register")}
          >
            Đăng ký tài khoản
          </Button>
          <AlertDialogCancel className="w-full border-none shadow-none text-muted-foreground hover:bg-transparent font-medium">
            Hủy
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
