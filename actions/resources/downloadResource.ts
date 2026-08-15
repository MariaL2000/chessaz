"use server";

import { prisma } from "@/lib/prisma";
import { getAuthorizedDownloadUrl } from "@/lib/get-authorized-download-url";

export async function downloadResourceAction(slug: string, userId?: string) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        price: true,
      },
    });

    if (!resource) {
      return {
        ok: false,
        message: "Resource not found or file not available.",
      };
    }

    const access = await getAuthorizedDownloadUrl(resource.id, { userId });

    if (!access.ok) {
      return { ok: false, message: access.message };
    }

    return { ok: true, fileUrl: access.downloadUrl };
  } catch (error) {
    console.error("Error processing download:", error);
    return {
      ok: false,
      message: "Internal server error while processing the download.",
    };
  }
}
