"use server";

import { prisma } from "@/lib/prisma";

export async function getResourceDetails(slug: string) {
  try {
    if (!slug) {
      return { ok: false, message: "Slug de recurso inválido." };
    }

    const resource = await prisma.resource.findUnique({
      where: { slug },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        reviews: {
          // Cambiamos select por include para traer la relación user
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!resource) {
      return { ok: false, message: "El recurso no existe o fue eliminado." };
    }

    return { ok: true, resource };
  } catch (error) {
    console.error("Error al obtener los detalles del recurso:", error);
    return { ok: false, message: "Error interno al servidor." };
  }
}
