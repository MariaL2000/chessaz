"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "login" | "register";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "login",
  size = "md",
  children,
  className = "",
  style,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-bold tracking-wide uppercase transition-all duration-200 rounded-full cursor-pointer border";

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-xs px-5 py-2";
      case "md":
        return "text-xs px-6 py-2.5";
      case "lg":
        return "text-sm px-8 py-3.5";
    }
  };

  const getVariantStyles = (): React.CSSProperties => {
    if (variant === "login") {
      return {
        backgroundColor: "var(--color-blue)",
        color: "#FFFFFF",
        borderColor: "transparent",
      };
    }

    // Variante 'register' (Estilo acentuado con dorado / claro)
    return {
      backgroundColor: "var(--color-gold)", // Tono dorado #A37B4C
      color: "#FFFFFF",
      borderColor: "var(--color-border-custom)",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    };
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`${baseClasses} ${getSizeClasses()} ${className}`}
      style={{
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
};
