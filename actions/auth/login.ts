"use server";

import { signIn } from "@/auth.config";
import { LoginSchema, LoginInput } from "@/schemas/auth.schema";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function loginUser(values: LoginInput) {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { ok: false, error: "Invalid fields" };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Buscamos el usuario para obtener su rol tras autenticarlo
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { role: true },
    });

    return { ok: true, role: user?.role };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { ok: false, error: "Invalid credentials" };
        default:
          return { ok: false, error: "Something went wrong" };
      }
    }

    throw error;
  }
}
