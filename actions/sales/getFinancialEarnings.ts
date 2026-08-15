"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";

export async function getFinancialEarnings(
  userId: string,
  userRole: Role | string,
) {
  try {
    if (
      !userId ||
      !userRole ||
      (userRole !== Role.ADMIN && userRole !== Role.TEACHER)
    ) {
      return {
        ok: false,
        sales: [],
        metrics: {
          totalGross: 0,
          totalPlatformFee: 0,
          totalTeacherEarnings: 0,
          salesCount: 0,
        },
        message: "Unauthorized access.",
      };
    }

    const isAdmin = userRole === Role.ADMIN;

    // Si es ADMIN, ve todas las ventas de la plataforma. Si es TEACHER, solo las de su TeacherProfile.
    const whereClause = isAdmin ? {} : { teacher: { userId: userId } };

    // Ejecutamos en paralelo la consulta de la lista y la agregación de sumas para mayor rendimiento
    const [sales, aggregation, salesCount] = await Promise.all([
      prisma.sale.findMany({
        where: whereClause,
        include: {
          purchase: {
            include: {
              user: { select: { name: true, email: true } },
              resource: { select: { title: true, slug: true } },
            },
          },
          teacher: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.sale.aggregate({
        where: whereClause,
        _sum: {
          grossAmount: true,
          platformFee: true,
          teacherEarnings: true,
        },
      }),
      prisma.sale.count({
        where: whereClause,
      }),
    ]);

    return {
      ok: true,
      sales,
      metrics: {
        totalGross: aggregation._sum.grossAmount || 0,
        totalPlatformFee: aggregation._sum.platformFee || 0,
        totalTeacherEarnings: aggregation._sum.teacherEarnings || 0,
        salesCount,
      },
    };
  } catch (error) {
    console.error("Error fetching financial earnings:", error);
    return {
      ok: false,
      sales: [],
      metrics: {
        totalGross: 0,
        totalPlatformFee: 0,
        totalTeacherEarnings: 0,
        salesCount: 0,
      },
      message: "Error loading financial data.",
    };
  }
}
