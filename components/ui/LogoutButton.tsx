"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/actions/auth/logout";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);

  const handleLogout = () => {
    startTransition(async () => {
      clearUser();
      const res = await logoutUser();

      if (res?.success) {
        router.push("/");
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className={
        className ||
        `w-full group relative inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 text-xs sm:text-sm font-semibold tracking-wide rounded-xl transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden border text-white`
      }
      style={{
        backgroundColor: "#c00505",
        borderColor: "#c00505",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-gold-hover)";
        e.currentTarget.style.borderColor = "var(--color-gold-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#c00505";
        e.currentTarget.style.borderColor = "#c00505";
      }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 w-full transition-colors">
        {isPending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Logging out...
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Log out
          </>
        )}
      </span>
    </button>
  );
}
