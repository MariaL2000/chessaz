"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createReviewSchema = z.object({
  resourceId: z.string().cuid(),
  userId: z.string().cuid(),
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
      // Se cambia de result.error.errors a result.error.issues
      message: result.error.issues[0].message,
    };
  }

  try {
    const { resourceId, userId, rating, comment } = result.data;

    const review = await prisma.review.create({
      data: {
        resourceId,
        userId,
        rating,
        comment,
      },
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
