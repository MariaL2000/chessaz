"use server";

import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { RegisterSchema, RegisterInput } from "@/schemas/auth.schema";

export async function registerUser(values: RegisterInput) {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { ok: false, error: "Invalid input data" };
  }

  const { name, email, password, role } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { ok: false, error: "An account with this email already exists" };
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        role: true,
      },
    });

    return { ok: true, role: newUser.role };
  } catch (error) {
    return { ok: false, error: "Could not create user account" };
  }
}
