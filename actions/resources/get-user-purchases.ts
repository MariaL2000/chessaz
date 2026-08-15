"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";

export interface DownloadItemDTO {
  id: string;
  pricePaid: number;
  isFree: boolean;
  createdAt: Date;
  user: {
    name: string;
    email: string;
    role: string;
  };
  guestEmail: string;
  resource: {
    id: string;
    title: string;
    slug: string;
    category: string;
    type: string;
    price: number;
  };
}

/**
 * Obtiene el historial de descargas del panel de control.
 * - ADMIN: Ve todas las descargas globales de la plataforma.
 * - TEACHER: Ve únicamente las descargas asociadas a los recursos creados por su TeacherProfile.
 */
export async function getUserDownloads(
  userId: string,
  userRole: Role | string,
): Promise<{
  ok: boolean;
  downloads: DownloadItemDTO[];
  totalAmountPaid: number;
  totalDownloads: number;
  message?: string;
}> {
  try {
    // 1. Validación de seguridad estricta
    if (
      !userId ||
      !userRole ||
      (userRole !== Role.ADMIN && userRole !== Role.TEACHER)
    ) {
      return {
        ok: false,
        downloads: [],
        totalAmountPaid: 0,
        totalDownloads: 0,
        message: "Unauthorized access.",
      };
    }

    const isAdmin = userRole === Role.ADMIN;

    // 2. Definición del filtro basado en tu relación de Prisma:
    // Resource -> TeacherProfile (donde teacher.userId === userId)
    const whereClause = isAdmin
      ? {}
      : {
          resource: {
            teacher: {
              userId: userId,
            },
          },
        };

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
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Sumar los montos reales pagados de la lista obtenida (tanto de pagos como de compras libres con valor)
    const totalAmountPaid = downloads.reduce(
      (acc, curr) => acc + (curr.pricePaid || 0),
      0,
    );
    const totalDownloads = downloads.length;

    return {
      ok: true,
      downloads: downloads as DownloadItemDTO[],
      totalAmountPaid,
      totalDownloads,
    };
  } catch (error) {
    console.error("Error fetching downloads history:", error);
    return {
      ok: false,
      downloads: [],
      totalAmountPaid: 0,
      totalDownloads: 0,
      message: "Failed to retrieve downloads history.",
    };
  }
}
