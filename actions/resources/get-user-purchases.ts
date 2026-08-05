"use server";

import { prisma } from "@/lib/prisma";
import { mapResourceToDTO } from "./resourceMappers";
import { ResourceDTO } from "@/types/resource";

/**
 * Obtiene los recursos adquiridos (comprados/descargados) por un usuario específico (Estudiante o Profesor)
 */
export async function getUserPurchases(
  userId: string,
): Promise<{ ok: boolean; resources: ResourceDTO[]; message?: string }> {
  try {
    if (!userId || userId.trim() === "") {
      return { ok: true, resources: [] };
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        userId: userId,
        status: "COMPLETED",
      },
      include: {
        resource: {
          include: {
            reviews: { select: { rating: true } },
            teacher: {
              include: {
                user: { select: { name: true, image: true, role: true } },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const resources = purchases.map((p) => mapResourceToDTO(p.resource));

    return {
      ok: true,
      resources,
    };
  } catch (error) {
    console.error("Error fetching user purchases:", error);
    return {
      ok: false,
      resources: [],
      message: "Failed to retrieve user purchases.",
    };
  }
}
