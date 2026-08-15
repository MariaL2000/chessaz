"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import { grantResourceAccess } from "@/lib/grant-resource-access";
import {
  buildResourceDownloadUrl,
  signResourceAccessToken,
} from "@/lib/resource-access-token";

export async function getAuthorizedDownloadUrl(
  resourceId: string,
  options?: { userId?: string; email?: string },
): Promise<{ ok: true; downloadUrl: string } | { ok: false; message: string }> {
  if (!resourceId) {
    return { ok: false, message: "Resource ID is required." };
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { id: true, price: true },
  });

  if (!resource) {
    return { ok: false, message: "Resource not found." };
  }

  let email = options?.email;
  const userId = options?.userId;
  let role: Role | undefined;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    });

    if (!user?.email) {
      return { ok: false, message: "User email not found." };
    }

    email = user.email;
    role = user.role;
  }

  if (!email) {
    return {
      ok: false,
      message: "Email verification is required to download this resource.",
    };
  }

  if (role === Role.ADMIN) {
    const access = await grantResourceAccess({
      email,
      resourceId,
      userId,
      pricePaid: 0,
      isFree: true,
    });

    return { ok: true, downloadUrl: access.downloadUrl };
  }

  const guestAccess = await prisma.guestAccess.findFirst({
    where: {
      resourceId,
      email,
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: "desc" },
  });

  if (guestAccess) {
    const accessToken = signResourceAccessToken(
      {
        sub: guestAccess.id,
        resourceId,
        email,
      },
      guestAccess.expiresAt,
    );

    return {
      ok: true,
      downloadUrl: buildResourceDownloadUrl(accessToken),
    };
  }

  if (resource.price === 0) {
    const access = await grantResourceAccess({
      email,
      resourceId,
      userId,
      pricePaid: 0,
      isFree: true,
    });

    return { ok: true, downloadUrl: access.downloadUrl };
  }

  return {
    ok: false,
    message:
      "Access expired or not found. Please verify your email or purchase again.",
  };
}
