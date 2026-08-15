"use server";

import { prisma } from "@/lib/prisma";

export async function getResourceDetails(slug: string) {
  try {
    if (!slug) {
      return { ok: false, message: "Invalid resource slug." };
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
                email: true,
              },
            },
          },
        },
        reviews: {
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
      return {
        ok: false,
        message: "The resource does not exist or has been deleted.",
      };
    }

    const { fileUrl: _fileUrl, ...publicResource } = resource;

    return { ok: true, resource: publicResource };
  } catch (error) {
    console.error("Error fetching resource details:", error);
    return { ok: false, message: "Internal server error." };
  }
}
