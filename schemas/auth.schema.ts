import { z } from "zod";
import { Role } from "@/app/generated/prisma/client";

// Esquema para el registro de usuario
export const RegisterSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at least 3 characters long" }),

  email: z
    .string({ message: "Email is required" })
    .trim()
    .email({ message: "Invalid email format" }),

  password: z
    .string({ message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" }),

  role: z
    .enum([Role.STUDENT, Role.TEACHER, Role.ADMIN], {
      message: "Invalid role selected",
    })
    .default(Role.TEACHER),
});

// Esquema para inicio de sesión
export const LoginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .trim()
    .email({ message: "Invalid email format" }),

  password: z
    .string({ message: "Password is required" })
    .min(1, { message: "Password is required" }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
