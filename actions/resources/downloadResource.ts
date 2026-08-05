// app/actions/resources/downloadResource.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function downloadResourceAction(slug: string) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { slug },
      select: {
        id: true,
        fileUrl: true,
        price: true,
      },
    });

    if (!resource || !resource.fileUrl) {
      return {
        ok: false,
        message: "Resource not found or file not available.",
      };
    }

    if (resource.price === 0) {
      // Aseguramos que la URL comience con https para evitar bloqueos de seguridad del navegador
      let secureUrl = resource.fileUrl;
      if (secureUrl.startsWith("http://")) {
        secureUrl = secureUrl.replace("http://", "https://");
      }

      return { ok: true, fileUrl: secureUrl };
    }

    return {
      ok: false,
      message: "You do not have permission to download this paid resource.",
    };
  } catch (error) {
    console.error("Error processing download:", error);
    return {
      ok: false,
      message: "Internal server error while processing the download.",
    };
  }
}
