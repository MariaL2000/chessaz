"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@/app/generated/prisma/client"; // Asegúrate de importar el enum Role

export async function downloadResourceAction(slug: string, userId?: string) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
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

    // 1. Verificación de permisos para ADMIN o TEACHER logueados
    let isAuthorized = false;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      // El Admin puede descargar todo siempre.
      // El Teacher puede descargar si es gratis, o si ya tiene lógica de acceso.
      if (user?.role === Role.ADMIN) {
        isAuthorized = true;
      }
    }

    // 2. Si es Admin, pasamos directo al retorno de la URL
    // Si no es Admin, mantenemos tu lógica original para recursos gratuitos
    if (isAuthorized || resource.price === 0) {
      // Registrar descarga solo si hay un usuario (no Admin para no ensuciar registros, o sí, según prefieras)
      if (userId && !isAuthorized) {
        // Ajusta esta lógica si quieres que el Admin registre descargas
        try {
          const existingDownload = await prisma.download.findFirst({
            where: { userId, resourceId: resource.id },
          });

          if (!existingDownload) {
            await prisma.download.create({
              data: {
                userId,
                resourceId: resource.id,
                pricePaid: 0,
                isFree: true,
              },
            });
            revalidatePath("/dashboard");
          }
        } catch (dbError) {
          console.error("Error saving download record:", dbError);
        }
      }

      // Asegurar HTTPS
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
