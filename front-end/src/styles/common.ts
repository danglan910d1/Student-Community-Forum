import { Variant, Size } from "@/types/comon";

// Base styles shared across all buttons
export const baseStyles =
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

// Variant styles
export const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary-dark text-text-light hover:opacity-80 shadow-hover-shadow focus:ring-primary-dark/50",

  "primary-light":
    "bg-primary-light text-primary-dark hover:bg-blue-200 focus:ring-primary-dark/30",

  secondary:
    "bg-secondary-dark text-text-default hover:opacity-80 shadow-sm focus:ring-secondary-dark/50",

  "secondary-light":
    "bg-secondary-light text-text-default border border-secondary-dark/20 hover:bg-secondary-dark/50 focus:ring-secondary-dark/30",

  tertiary:
    "bg-tertiary-dark text-text-light hover:opacity-80 shadow-hover-shadow focus:ring-tertiary-dark/50",

  "tertiary-light":
    "bg-tertiary-light text-tertiary-light-text hover:bg-red-100 focus:ring-tertiary-dark/30",

  default:
    "bg-transparent text-text-default border border-secondary-dark hover:bg-hover-light-bg hover:text-primary-dark",

  link: "bg-transparent text-primary-dark underline underline-offset-4 hover:opacity-80 p-0 h-auto shadow-none border-none",
};

// Size styles
export const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-2",
};
