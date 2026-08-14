"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth/register";
import { loginUser } from "@/actions/auth/login";
import { Button } from "@/components/ui/Button";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { useAuthStore } from "@/store/useAuthStore";

type UserRole = "TEACHER" | "ADMIN";

export default function SignUpPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const getDashboardPath = (role: UserRole) => {
    switch (role) {
      case "TEACHER":
        return "/dashboard/teacher";
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
      const userRole = (loginRes.role as UserRole) || role;

      // Actualizamos Zustand de forma segura
      setUser({
        id: "id" in result ? result.id || "" : "",
        name: loginRes.name || name,
        email: loginRes.email || email,
        role: userRole,
        image: loginRes.image || "",
      });

      const targetPath = getDashboardPath(userRole);
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
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

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
          </select>
        </div>

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
