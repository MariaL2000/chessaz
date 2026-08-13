import React from "react";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "blue" | "outline";
  children: React.ReactNode;
}
//button de descarga del recurso
export const CustomButton: React.FC<CustomButtonProps> = ({
  variant = "gold",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95";

  const variants = {
    gold: "bg-[var(--color-gold)] text-white hover:bg-[var(--color-gold-hover)]",
    blue: "bg-[var(--color-blue)] text-white hover:bg-[var(--color-blue-hover)]",
    outline:
      "border border-[var(--color-border-custom)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
