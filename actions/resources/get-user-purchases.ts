"use server";

import { prisma } from "@/lib/prisma";

//listar los recursos descargados
export interface DownloadItemDTO {
  id: string;
  pricePaid: number;
  isFree: boolean;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
    role: string;
  };
  resource: {
    id: string;
    title: string;
    slug: string;
    category: string;
    type: string;
    fileUrl: string;
    price: number;
  };
}

/**
 * Obtiene las descargas del sitio.
 * - Si es ADMIN, devuelve TODAS las descargas de la plataforma (para el panel de Admin).
 */
export async function getUserDownloads(
  userId?: string,
  userRole?: "ADMIN" | "TEACHER" | string,
): Promise<{ ok: boolean; downloads: DownloadItemDTO[]; message?: string }> {
  try {
    const isAdmin = userRole === "ADMIN";

    // Si no es admin, filtramos estrictamente por el userId del usuario actual
    const whereClause = isAdmin ? {} : { userId: userId || "" };

    if (!isAdmin && (!userId || userId.trim() === "")) {
      return { ok: true, downloads: [] };
    }

    const downloads = await prisma.download.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
        resource: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            type: true,
            fileUrl: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Ordenadas de más reciente a más antigua
      },
    });

    return {
      ok: true,
      downloads: downloads as DownloadItemDTO[],
    };
  } catch (error) {
    console.error("Error fetching user downloads:", error);
    return {
      ok: false,
      downloads: [],
      message: "Failed to retrieve downloads history.",
    };
  }
}
