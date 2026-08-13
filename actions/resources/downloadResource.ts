"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function downloadResourceAction(slug: string, userId?: string) {
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
      // Registrar la descarga en la base de datos si el usuario está autenticado
      if (userId) {
        try {
          await prisma.download.create({
            data: {
              userId,
              resourceId: resource.id,
              pricePaid: 0,
              isFree: true,
            },
          });
          revalidatePath("/dashboard");
        } catch (dbError) {
          console.error("Error saving download record:", dbError);
        }
      }

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
