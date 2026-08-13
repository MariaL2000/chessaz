"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/actions/auth/login";
import { Button } from "@/components/ui/Button";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { useAuthStore } from "@/store/useAuthStore";

type UserRole = "TEACHER" | "STUDENT" | "ADMIN";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
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

    // Actualizamos el estado global incluyendo el id obligatorio
    setUser({
      id: res.id || "",
      name: res.name || "",
      email: res.email || email,
      role: (res.role as UserRole) || "STUDENT",
      image: res.image || "",
    });

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
              {showPassword ? "Hide" : "Show"}
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
