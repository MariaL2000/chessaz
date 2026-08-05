"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";

interface GetUsersOptions {
  page?: number;
  take?: number;
  query?: string;
}

/**
 * Obtiene usuarios paginados con soporte de búsqueda por nombre o email
 */
export async function getPaginatedUsers({
  page = 1,
  take = 10,
  query = "",
}: GetUsersOptions) {
  if (isNaN(Number(page)) || page < 1) page = 1;

  try {
    const whereCondition = query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {};

    const totalCount = await prisma.user.count({ where: whereCondition });
    const totalPages = Math.ceil(totalCount / take);

    const users = await prisma.user.findMany({
      take,
      skip: (page - 1) * take,
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      ok: true,
      currentPage: page,
      totalPages,
      totalCount,
      users,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { ok: false, message: "Could not retrieve users", users: [] };
  }
}

/**
 * Permite al administrador cambiar el rol de un usuario (USER, TEACHER, ADMIN)
 */
export async function updateUserRole(userId: string, newRole: Role) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    // Si se asigna el rol TEACHER, nos aseguramos de que tenga un TeacherProfile creado
    if (newRole === Role.TEACHER) {
      const existingProfile = await prisma.teacherProfile.findUnique({
        where: { userId },
      });
      if (!existingProfile) {
        await prisma.teacherProfile.create({
          data: { userId },
        });
      }
    }

    revalidatePath("/admin/users");
    return {
      ok: true,
      message: `Rol actualizado a ${newRole} exitosamente.`,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { ok: false, message: "No se pudo actualizar el rol del usuario." };
  }
}
