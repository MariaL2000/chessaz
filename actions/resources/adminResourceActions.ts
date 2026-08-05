"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function reviewResource({
  resourceId,
  adminUserId,
  action,
}: {
  resourceId: string;
  adminUserId: string;
  action: "APPROVE" | "REJECT";
}) {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      return {
        ok: false,
        message: "You do not have administrator permissions.",
      };
    }

    if (action === "APPROVE") {
      const updatedResource = await prisma.resource.update({
        where: { id: resourceId },
        data: { isPublished: true },
      });

      revalidatePath("/dashboard/admin");
      revalidatePath("/");

      return {
        ok: true,
        message: "Resource successfully approved and published!",
        resource: updatedResource,
      };
    } else {
      await prisma.resource.delete({
        where: { id: resourceId },
      });

      revalidatePath("/dashboard/admin");

      return {
        ok: true,
        message: "Resource rejected and deleted from the database.",
      };
    }
  } catch (error) {
    console.error("Error processing resource review:", error);
    return {
      ok: false,
      message: "An error occurred on the server while processing the action.",
    };
  }
}

export async function deleteResource({
  resourceId,
  adminUserId,
}: {
  resourceId: string;
  adminUserId: string;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!user || user.role !== Role.ADMIN) {
      return {
        ok: false,
        message:
          "You do not have administrator permissions to delete resources.",
      };
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/");

    return { ok: true, message: "Resource successfully deleted." };
  } catch (error) {
    console.error("Error deleting resource:", error);
    return {
      ok: false,
      message: "An error occurred on the server while deleting the resource.",
    };
  }
}
