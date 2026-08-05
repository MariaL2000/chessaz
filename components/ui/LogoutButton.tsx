"use client";

import { useTransition } from "react";
import { logoutUser } from "@/actions/auth/logout";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className={
        className ||
        "px-4 py-2 text-xs font-bold rounded-xl border transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
      }
      style={{ borderColor: "var(--color-border-custom)" }}
    >
      {isPending ? "Cerrando sesión..." : "Cerrar Sesión"}
    </button>
  );
}
