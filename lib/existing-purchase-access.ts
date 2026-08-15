import { PurchaseStatus } from "@/app/generated/prisma/client";
import { grantResourceAccess } from "@/lib/grant-resource-access";
import { prisma } from "@/lib/prisma";

type ExistingPurchaseAccessInput = {
  userId: string;
  resourceId: string;
  email: string;
};

export async function getCompletedPurchaseAccess({
  userId,
  resourceId,
  email,
}: ExistingPurchaseAccessInput) {
  const existingPurchase = await prisma.purchase.findFirst({
    where: {
      userId,
      resourceId,
      status: PurchaseStatus.COMPLETED,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!existingPurchase) {
    return null;
  }

  const access = await grantResourceAccess({
    email,
    resourceId,
    userId,
    pricePaid: existingPurchase.amount,
    isFree: false,
  });

  return {
    purchaseId: existingPurchase.id,
    accessToken: access.accessToken,
    downloadUrl: access.downloadUrl,
    expiresAt: access.expiresAt.toISOString(),
    accessDays: access.accessDays,
  };
}
