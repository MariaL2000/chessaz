"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/actions/auth/login";
import { Button } from "@/components/ui/Button";
import { AuthBackground } from "@/components/auth/AuthBackground";

type UserRole = "TEACHER" | "STUDENT" | "ADMIN";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getDashboardPath = (role?: UserRole) => {
    switch (role) {
      case "TEACHER":
        return "/dashboard/teacher";
      case "STUDENT":
        return "/dashboard/student";
      case "ADMIN":
        return "/dashboard/admin";
      default:
        return "/dashboard";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await loginUser({ email, password });

    if (!res.ok) {
      setError(res.error || "An error occurred while logging in");
      setLoading(false);
      return;
    }

    const targetPath = getDashboardPath(res.role as UserRole);
    router.push(targetPath);
    router.refresh();
  };

  return (
    <AuthBackground
      title="Welcome back"
      subtitle="Sign in to your training platform"
    >
      {error && (
        <div className="p-3 mb-4 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label
            className="block text-xs font-bold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--color-text-main)" }}
          >
            Email address
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="coach@chezz.com"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
            style={{
              borderColor: "var(--color-border-custom)",
              backgroundColor: "var(--color-bg-card)",
              color: "var(--color-text-main)",
            }}
          />
        </div>

        {/* Password */}
        <div>
          <label
            className="block text-xs font-bold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--color-text-main)" }}
          >
            Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all focus:ring-2"
              style={{
                borderColor: "var(--color-border-custom)",
                backgroundColor: "var(--color-bg-card)",
                color: "var(--color-text-main)",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                /* Icono Ojo Tachado (EyeOff) */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .698 10.355 10.355 0 0 1-4.02 4.887" />
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                  <path d="M17.479 17.499A10.75 10.75 0 0 1 12 19c-5.523 0-10-7-10-7a10.738 10.738 0 0 1 3.254-4.2" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                /* Icono Ojo (Eye) */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <Button
          variant="login"
          size="lg"
          className="w-full mt-2 cursor-pointer"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p
        className="text-xs text-center mt-6 font-medium"
        style={{ color: "var(--color-text-subtle)" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-bold underline hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-gold)" }}
        >
          Sign up for free
        </Link>
      </p>
    </AuthBackground>
  );
}
