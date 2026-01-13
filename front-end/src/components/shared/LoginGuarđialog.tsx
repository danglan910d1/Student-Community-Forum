"use client";

import { useState, ReactNode } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthGuardDialog } from "./AuthGuardDialog";

interface LoginGuardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function LoginGuard({
  children,
  title,
  description,
  className,
}: LoginGuardProps) {
  const { isAuthenticated } = useAuthStore();
  const [showDialog, setShowDialog] = useState(false);

  const handleCaptureClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      setShowDialog(true);
    }
  };

  return (
    <>
      <div onClickCapture={handleCaptureClick} className={className}>
        {children}
      </div>

      <AuthGuardDialog
        isOpen={showDialog}
        onOpenChange={setShowDialog}
        title={title}
        description={description}
      />
    </>
  );
}
