"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: LucideIcon;
}

export const FooterLink = ({ href, children, icon: Icon }: FooterLinkProps) => {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    // Kiểm tra nếu đường dẫn hiện tại trùng hoàn toàn với href của link
    if (pathname === href) {
      e.preventDefault();
      window.location.reload(); // Ép trình duyệt tải lại toàn bộ dữ liệu
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="group flex items-center gap-2 hover:text-blue-400 transition-all duration-300"
    >
      {Icon && (
        <Icon
          size={16}
          className="group-hover:scale-110 transition-transform duration-300"
        />
      )}
      <span>{children}</span>
    </Link>
  );
};
