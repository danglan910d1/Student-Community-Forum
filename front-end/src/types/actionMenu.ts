import { LucideIcon } from "lucide-react";
import { ReactNode, ElementType } from "react";

export interface ActionItemConfig {
  label?: string;
  icon?: LucideIcon | ElementType;
  href?: string; // Link thô từ Constant
  onClick?: () => void; // Logic thực thi từ Hook
  variant?: "default" | "destructive";
  component?: ReactNode; // Dành cho DeletePostButton
  show?: boolean;
}
