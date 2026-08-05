import React from "react";
import { Loader2 } from "lucide-react";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

export function ActionButton({
  isLoading = false,
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ActionButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-90";
      case "danger":
        return "bg-rose-600 text-white hover:bg-rose-700 shadow-sm";
      case "primary":
      default:
        return "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 shadow-md";
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`py-2.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${getVariantStyles()} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
