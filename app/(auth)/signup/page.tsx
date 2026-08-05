"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth/register";
import { loginUser } from "@/actions/auth/login";
import { Button } from "@/components/ui/Button";
import { AuthBackground } from "@/components/auth/AuthBackground";

type UserRole = "TEACHER" | "STUDENT" | "ADMIN";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const getDashboardPath = (role: UserRole) => {
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
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = (formData.get("role") as UserRole) || "TEACHER";

    // 1. Crear el usuario
    const result = await registerUser({ name, email, password, role });

    if (!result.ok) {
      setError(result.error || "Could not register account");
      setLoading(false);
      return;
    }

    // 2. Iniciar sesión automáticamente
    const loginRes = await loginUser({ email, password });

    if (loginRes.ok) {
      // 3. Redirigir al dashboard correspondiente según el rol elegido
      const targetPath = getDashboardPath(role);
      router.push(targetPath);
      router.refresh();
    } else {
      router.push("/login");
    }
  };

  return (
    <AuthBackground
      title="Create your account"
      subtitle="Join Chezz and access your dashboard instantly"
    >
      {error && (
        <div className="p-3 mb-4 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            className="block text-xs font-bold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--color-text-main)" }}
          >
            Full Name
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Garry Kasparov"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2"
            style={{
              borderColor: "var(--color-border-custom)",
              backgroundColor: "var(--color-bg-card)",
              color: "var(--color-text-main)",
            }}
          />
        </div>

        {/* Email Address */}
        <div>
          <label
            className="block text-xs font-bold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--color-text-main)" }}
          >
            Email Address
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

        {/* Password con Ojito */}
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
              minLength={6}
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

        {/* User Role */}
        <div>
          <label
            className="block text-xs font-bold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--color-text-main)" }}
          >
            How will you use Chezz?
          </label>
          <select
            name="role"
            defaultValue="TEACHER"
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 cursor-pointer"
            style={{
              borderColor: "var(--color-border-custom)",
              backgroundColor: "var(--color-bg-card)",
              color: "var(--color-text-main)",
            }}
          >
            <option value="TEACHER">Coach / Creator</option>
            <option value="STUDENT">Chess Student</option>
          </select>
        </div>

        {/* Submit Button */}
        <Button
          variant="register"
          size="lg"
          className="w-full mt-2 cursor-pointer"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up & Get Started"}
        </Button>
      </form>

      {/* Footer Link */}
      <p
        className="text-xs text-center mt-6 font-medium"
        style={{ color: "var(--color-text-subtle)" }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold underline hover:opacity-80 transition-opacity"
          style={{ color: "var(--color-gold)" }}
        >
          Sign in
        </Link>
      </p>
    </AuthBackground>
  );
}
