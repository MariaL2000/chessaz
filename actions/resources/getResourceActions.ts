"use server";

import { prisma } from "@/lib/prisma";
import { ChessCategory, ResourceType } from "@/app/generated/prisma/client";
import { mapResourceToDTO } from "./resourceMappers";
import { ResourceDTO } from "@/types/resource";

export interface ResourceFilterOptions {
  query?: string;
  category?: ChessCategory;
  type?: ResourceType;
  minElo?: number;
  maxElo?: number;
  hasHomework?: boolean;
  maxPrice?: number;
  isFree?: boolean;
  page?: number; // <--- Página actual para la paginación
  limit?: number; // <--- Cantidad de elementos por página
}

/**
 * Obtiene exclusivamente los recursos de la comunidad subidos por teachers (excluyendo admins)
 */
export async function getCommunityResources(limit: number = 50) {
  try {
    const resources = await prisma.resource.findMany({
      where: {
        isPublished: true,
        // Excluimos explícitamente cualquier recurso cuyo profesor pertenezca a un usuario ADMIN
        NOT: {
          teacher: {
            is: {
              user: {
                role: "ADMIN",
              },
            },
          },
        },
        // Aseguramos que el recurso tenga obligatoriamente un profesor vinculado usando 'is: {}'
        teacher: {
          is: {},
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        reviews: { select: { rating: true } },
        teacher: {
          include: {
            user: { select: { name: true, image: true, role: true } },
          },
        },
      },
    });

    return { ok: true, resources: resources.map(mapResourceToDTO) };
  } catch (error) {
    console.error("Error fetching community resources:", error);
    return {
      ok: false,
      message: "Failed to retrieve community resources.",
      resources: [],
    };
  }
}

/**
 * Obtiene los 10 recursos más recientes publicados
 */
export async function getRecentResources(limit: number = 10) {
  try {
    const resources = await prisma.resource.findMany({
      where: { isPublished: true },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        reviews: { select: { rating: true } },
        teacher: {
          include: {
            user: { select: { name: true, image: true, role: true } },
          },
        },
      },
    });

    return { ok: true, resources: resources.map(mapResourceToDTO) };
  } catch (error) {
    console.error("Error fetching recent resources:", error);
    return {
      ok: false,
      message: "Failed to retrieve recent resources.",
      resources: [],
    };
  }
}

/**
 * Obtiene los recursos creados por un profesor específico usando su ID de usuario o perfil de profesor
 */
export async function getResourceByTeacherId(teacherId: string) {
  try {
    // Buscamos el perfil de profesor vinculado a este usuario (o directamente por su id de teacher)
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: {
        OR: [{ id: teacherId }, { userId: teacherId }],
      },
    });

    if (!teacherProfile) {
      return { ok: true, resources: [] };
    }

    const resources = await prisma.resource.findMany({
      where: { teacherId: teacherProfile.id },
      orderBy: { createdAt: "desc" },
      include: {
        reviews: { select: { rating: true } },
        teacher: {
          include: {
            user: { select: { name: true, image: true, role: true } },
          },
        },
      },
    });

    return { ok: true, resources: resources.map(mapResourceToDTO) };
  } catch (error) {
    console.error("Error fetching resources by teacher id:", error);
    return {
      ok: false,
      message: "Failed to retrieve teacher resources.",
      resources: [],
    };
  }
}

/**
 * Obtiene recursos filtrados por múltiples criterios de forma optimizada, dinámica y con paginación
 */
export const getFilteredResources = async (filters: ResourceFilterOptions) => {
  try {
    const {
      query,
      category,
      type,
      minElo,
      maxElo,
      hasHomework,
      maxPrice,
      isFree,
      page = 1,
      limit = 9, // Por defecto 9 elementos por página estilo tienda
    } = filters;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const andConditions: any[] = [];

    if (query && query.trim() !== "") {
      andConditions.push({
        OR: [
          { title: { contains: query.trim(), mode: "insensitive" } },
          { description: { contains: query.trim(), mode: "insensitive" } },
        ],
      });
    }

    if (category) {
      andConditions.push({ category });
    }

    if (type) {
      andConditions.push({ type });
    }

    if (hasHomework === true) {
      andConditions.push({ hasHomework: true });
    }

    if (minElo !== undefined) {
      andConditions.push({ minElo: { gte: minElo } });
    }

    if (maxElo !== undefined) {
      andConditions.push({ maxElo: { lte: maxElo } });
    }

    if (isFree === true) {
      andConditions.push({ price: 0 });
    } else if (maxPrice !== undefined) {
      andConditions.push({ price: { lte: maxPrice } });
    }

    const whereClause = {
      isPublished: true,
      AND: andConditions,
    };

    // Calcular la paginación de forma segura
    const currentPage = Number(page) < 1 ? 1 : Number(page);
    const skip = (currentPage - 1) * limit;

    // Consultar en paralelo la cantidad total y los recursos de la página actual
    const [totalCount, resources] = await Promise.all([
      prisma.resource.count({ where: whereClause }),
      prisma.resource.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        include: {
          reviews: { select: { rating: true } },
          teacher: {
            include: {
              user: { select: { name: true, image: true, role: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      ok: true,
      resources: resources.map(mapResourceToDTO),
      totalPages: totalPages > 0 ? totalPages : 1,
    };
  } catch (error) {
    console.error("Error al filtrar recursos:", error);
    return { ok: false, resources: [], totalPages: 1 };
  }
};

/**
 * Busca recursos por nombre / título
 */
export const searchResourcesByName = async (name: string) => {
  try {
    if (!name || name.trim() === "") {
      return { ok: true, resources: [] };
    }

    const resources = await prisma.resource.findMany({
      where: {
        isPublished: true,
        title: { contains: name.trim(), mode: "insensitive" },
      },
      include: {
        reviews: { select: { rating: true } },
        teacher: {
          include: {
            user: { select: { name: true, image: true, role: true } },
          },
        },
      },
      orderBy: { title: "asc" },
      take: 10,
    });

    return { ok: true, resources: resources.map(mapResourceToDTO) };
  } catch (error) {
    console.error("Error al buscar recursos por nombre:", error);
    return { ok: false, resources: [] };
  }
};

/**
 * Obtiene los recursos pendientes de revisión (isPublished: false)
 */
export async function getPendingResources() {
  try {
    const resources = await prisma.resource.findMany({
      where: { isPublished: false },
      include: {
        teacher: {
          include: {
            user: {
              select: { name: true, email: true, image: true, role: true },
            },
          },
        },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { ok: true, resources: resources.map(mapResourceToDTO) };
  } catch (error) {
    console.error("Error al obtener recursos pendientes:", error);
    return { ok: false, resources: [] };
  }
}
