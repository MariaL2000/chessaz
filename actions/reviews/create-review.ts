/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createReviewSchema = z.object({
  resourceId: z.string().cuid(),
  // Permitimos string general para que acepte tanto CUIDs de usuarios como emails de invitados
  userId: z.string().min(1, "User ID or email is required"),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .min(30, "The review must be at least 30 characters long."),
});

export async function createReview(formData: {
  resourceId: string;
  userId: string;
  rating: number;
  comment: string;
}) {
  const result = createReviewSchema.safeParse(formData);

  if (!result.success) {
    return {
      ok: false,
      message: result.error.issues[0].message,
    };
  }

  try {
    const { resourceId, userId, rating, comment } = result.data;

    // Determinamos si el userId es un CUID válido de usuario registrado o un correo/guest
    const isCuid = userId.length === 25 && userId.startsWith("c"); // o validación equivalente

    const reviewData: any = {
      resourceId,
      rating,
      comment,
    };

    if (isCuid) {
      reviewData.userId = userId;
    } else {
      // Si es un invitado, guardamos su identificador/correo en un campo opcional o como guestEmail si tu modelo lo soporta,
      // o lo vinculamos si tu base de datos lo permite. Ajusta según tu esquema Prisma.
      reviewData.guestEmail = userId;
    }

    const review = await prisma.review.create({
      data: reviewData,
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });

    revalidatePath(`/resources/[slug]`);

    return { ok: true, review };
  } catch (error) {
    console.error("Error creating review:", error);
    return { ok: false, message: "Error saving the review. Try again." };
  }
}
