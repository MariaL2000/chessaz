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

    // Buscamos el usuario incluyendo el id
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true, role: true, image: true },
    });

    return {
      ok: true,
      id: user?.id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      image: user?.image,
    };
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
