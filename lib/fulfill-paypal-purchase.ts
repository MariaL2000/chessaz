import { Resend } from "resend";
import { PurchaseStatus } from "@/app/generated/prisma/client";
import { grantResourceAccess } from "@/lib/grant-resource-access";
import { calculateSaleSplit, formatPayPalAmount } from "@/lib/platform-fees";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

type FulfillPayPalPurchaseInput = {
  purchaseId: string;
  captureId: string;
  paidAmount: number;
  sendConfirmationEmail?: boolean;
};

export async function fulfillPayPalPurchase({
  purchaseId,
  captureId,
  paidAmount,
  sendConfirmationEmail = true,
}: FulfillPayPalPurchaseInput) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      sale: true,
      user: { select: { id: true, email: true } },
      resource: {
        select: {
          id: true,
          title: true,
          price: true,
          teacherId: true,
          isPublished: true,
        },
      },
    },
  });

  if (!purchase) {
    throw new Error("Purchase not found.");
  }

  if (purchase.status === PurchaseStatus.COMPLETED) {
    const email = purchase.user.email;
    if (!email) {
      return { alreadyFulfilled: true as const, purchaseId: purchase.id };
    }

    const access = await grantResourceAccess({
      email,
      resourceId: purchase.resourceId,
      userId: purchase.userId,
      pricePaid: purchase.amount,
      isFree: false,
    });

    return {
      alreadyFulfilled: true as const,
      purchaseId: purchase.id,
      downloadUrl: access.downloadUrl,
      accessToken: access.accessToken,
      expiresAt: access.expiresAt.toISOString(),
    };
  }

  if (!purchase.resource.isPublished || purchase.resource.price <= 0) {
    throw new Error("Resource is not available for purchase.");
  }

  if (
    formatPayPalAmount(paidAmount) !==
    formatPayPalAmount(purchase.resource.price)
  ) {
    throw new Error("Paid amount does not match resource price.");
  }

  const email = purchase.user.email;
  if (!email) {
    throw new Error("Purchase user email not found.");
  }

  const split = calculateSaleSplit(purchase.resource.price);

  await prisma.$transaction(async (tx) => {
    await tx.purchase.update({
      where: { id: purchase.id },
      data: {
        status: PurchaseStatus.COMPLETED,
        paypalCaptureId: captureId,
        amount: paidAmount,
      },
    });

    if (!purchase.sale) {
      await tx.sale.create({
        data: {
          purchaseId: purchase.id,
          teacherId: purchase.resource.teacherId,
          grossAmount: split.grossAmount,
          platformFee: split.platformFee,
          teacherEarnings: split.teacherEarnings,
        },
      });
    }

    const existingDownload = await tx.download.findFirst({
      where: {
        resourceId: purchase.resourceId,
        OR: [{ userId: purchase.userId }, { guestEmail: email }],
      },
    });

    if (!existingDownload) {
      await tx.download.create({
        data: {
          userId: purchase.userId,
          resourceId: purchase.resourceId,
          pricePaid: paidAmount,
          isFree: false,
        },
      });
    }
  });

  const access = await grantResourceAccess({
    email,
    resourceId: purchase.resourceId,
    userId: purchase.userId,
    pricePaid: paidAmount,
    isFree: false,
  });

  if (sendConfirmationEmail && process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Chess Platform <onboarding@resend.dev>",
      to: [email],
      subject: "Your Chessaz purchase is ready!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto;">
          <h2 style="color: #d97706;">Payment confirmed</h2>
          <p>Your purchase of <strong>${purchase.resource.title}</strong> was successful.</p>
          <p>Platform fee: <strong>$${split.platformFee.toFixed(2)}</strong> (${split.platformFeePercent}%)</p>
          <p>Teacher earnings: <strong>$${split.teacherEarnings.toFixed(2)}</strong></p>
          <p>You can access your file for the next <strong>${access.accessDays} days</strong>.</p>
          <a href="${access.downloadUrl}" style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Download File</a>
        </div>
      `,
    });
  }

  return {
    alreadyFulfilled: false as const,
    purchaseId: purchase.id,
    downloadUrl: access.downloadUrl,
    accessToken: access.accessToken,
    expiresAt: access.expiresAt.toISOString(),
    platformFee: split.platformFee,
    teacherEarnings: split.teacherEarnings,
  };
}

export async function findPurchaseForPayPalOrder(orderId: string) {
  return prisma.purchase.findFirst({
    where: { paypalOrderId: orderId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      paypalOrderId: true,
    },
  });
}
