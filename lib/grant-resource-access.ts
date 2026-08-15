import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  buildResourceDownloadUrl,
  getResourceAccessDays,
  signResourceAccessToken,
} from "@/lib/resource-access-token";

type GrantResourceAccessInput = {
  email: string;
  resourceId: string;
  userId?: string;
  pricePaid: number;
  isFree: boolean;
};

export async function grantResourceAccess({
  email,
  resourceId,
  userId,
  pricePaid,
  isFree,
}: GrantResourceAccessInput) {
  const accessDays = getResourceAccessDays();
  const expiresAt = new Date(Date.now() + accessDays * 24 * 60 * 60 * 1000);

  let guestAccess = await prisma.guestAccess.findFirst({
    where: {
      email,
      resourceId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: "desc" },
  });

  if (!guestAccess) {
    guestAccess = await prisma.guestAccess.create({
      data: {
        email,
        resourceId,
        token: randomBytes(32).toString("hex"),
        expiresAt,
      },
    });
  } else if (guestAccess.expiresAt < expiresAt) {
    guestAccess = await prisma.guestAccess.update({
      where: { id: guestAccess.id },
      data: { expiresAt },
    });
  }

  const existingDownload = await prisma.download.findFirst({
    where: {
      resourceId,
      OR: [
        userId ? { userId } : undefined,
        { guestEmail: email },
      ].filter(Boolean) as Array<{ userId: string } | { guestEmail: string }>,
    },
  });

  if (!existingDownload) {
    await prisma.download.create({
      data: {
        userId: userId ?? null,
        guestEmail: userId ? null : email,
        resourceId,
        pricePaid,
        isFree,
      },
    });
  }

  const accessToken = signResourceAccessToken(
    {
      sub: guestAccess.id,
      resourceId,
      email,
    },
    guestAccess.expiresAt,
  );

  return {
    accessToken,
    downloadUrl: buildResourceDownloadUrl(accessToken),
    expiresAt: guestAccess.expiresAt,
    accessDays,
  };
}
