import { forwardRef } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "default";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const base =
  "px-4 py-2 rounded-lg font-semibold transition-all duration-150 ease-in-out shadow-md";

const variantClasses: Record<ButtonVariant, string> = {
  /* 1. PRIMARY DARK (#1c395f) */
  // primary: "bg-primary-dark text-text-light hover:hover-dark",
  primary: "container-base",

  /* 2. SECONDARY DARK (#dcdad9) */
  secondary: "bg-secondary-dark text-text-default hover:hover-dark",

  /* 3. TERTIARY DARK (#c26b32) */
  tertiary: "bg-tertiary-dark text-text-light hover:hover-dark",

  /* 4. DEFAULT BUTTON (white background, border) */
  default:
    "bg-white text-text-title border border-border-light hover:hover-light",
};

const stateClasses =
  "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(base, variantClasses[variant], stateClasses, className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
