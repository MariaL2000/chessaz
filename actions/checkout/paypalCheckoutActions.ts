"use server";

import { cookies } from "next/headers";
import { Resend } from "resend";
import { PurchaseStatus } from "@/app/generated/prisma/client";
import { grantResourceAccess } from "@/lib/grant-resource-access";
import { calculateSaleSplit, formatPayPalAmount } from "@/lib/platform-fees";
import { capturePayPalOrder, createPayPalOrder } from "@/lib/paypal";
import { getPayPalSellerBlockReason } from "@/lib/paypal-seller";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

type CheckoutIdentity = {
  resourceId: string;
  userId: string;
  email: string;
};

async function validateCheckoutIdentity({
  resourceId,
  userId,
  email,
}: CheckoutIdentity) {
  const verifiedEmail = (await cookies()).get("verified_checkout_email")?.value;

  if (!verifiedEmail || verifiedEmail.toLowerCase() !== email.toLowerCase()) {
    throw new Error("Email verification is required before payment.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email || user.email.toLowerCase() !== email.toLowerCase()) {
    throw new Error("Checkout user does not match the verified email.");
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: {
      id: true,
      title: true,
      price: true,
      isPublished: true,
      teacherId: true,
      teacher: {
        select: {
          paypalMerchantId: true,
          paypalOnboardingStatus: true,
          paypalBusinessName: true,
          paypalBusinessEmail: true,
        },
      },
    },
  });

  if (!resource || !resource.isPublished || resource.price <= 0) {
    throw new Error("This resource is not available for purchase.");
  }

  const paypalBlockReason = getPayPalSellerBlockReason(resource.teacher);
  if (paypalBlockReason) {
    throw new Error(
      `${paypalBlockReason} The teacher must finish PayPal setup in Profile before checkout works.`,
    );
  }

  const existingPurchase = await prisma.purchase.findFirst({
    where: {
      userId,
      resourceId,
      status: PurchaseStatus.COMPLETED,
    },
  });

  if (existingPurchase) {
    throw new Error("You already purchased this resource.");
  }

  return resource;
}

export async function createPayPalOrderAction(input: CheckoutIdentity) {
  try {
    const resource = await validateCheckoutIdentity(input);
    const split = calculateSaleSplit(resource.price);

    const pendingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: input.userId,
        resourceId: input.resourceId,
        status: PurchaseStatus.PENDING,
      },
      orderBy: { createdAt: "desc" },
    });

    if (pendingPurchase?.paypalOrderId) {
      return {
        ok: true as const,
        orderId: pendingPurchase.paypalOrderId,
        platformFeePercent: split.platformFeePercent,
        platformFee: split.platformFee,
        teacherEarnings: split.teacherEarnings,
      };
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId: input.userId,
        resourceId: input.resourceId,
        amount: resource.price,
        status: PurchaseStatus.PENDING,
      },
    });

    const { orderId, usedMarketplaceSplit } = await createPayPalOrder({
      purchaseId: purchase.id,
      amount: resource.price,
      description: resource.title,
      sellerMerchantId: resource.teacher.paypalMerchantId!,
      platformFee: split.platformFee,
    });

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { paypalOrderId: orderId },
    });

    return {
      ok: true as const,
      orderId,
      usedMarketplaceSplit,
      platformFeePercent: split.platformFeePercent,
      platformFee: split.platformFee,
      teacherEarnings: split.teacherEarnings,
    };
  } catch (error) {
    console.error("createPayPalOrderAction error:", error);
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to start PayPal checkout.",
    };
  }
}

export async function capturePayPalOrderAction(
  input: CheckoutIdentity & { orderId: string },
) {
  try {
    const resource = await validateCheckoutIdentity(input);

    const purchase = await prisma.purchase.findFirst({
      where: {
        paypalOrderId: input.orderId,
        userId: input.userId,
        resourceId: input.resourceId,
        status: PurchaseStatus.PENDING,
      },
    });

    if (!purchase) {
      throw new Error("Pending purchase not found for this PayPal order.");
    }

    const captureResult = await capturePayPalOrder(input.orderId);

    if (captureResult.status !== "COMPLETED") {
      throw new Error("PayPal payment was not completed.");
    }

    const capture = captureResult.purchase_units[0]?.payments?.captures?.[0];

    if (!capture || capture.status !== "COMPLETED") {
      throw new Error("PayPal capture was not completed.");
    }

    const paidAmount = Number(capture.amount?.value ?? 0);

    if (formatPayPalAmount(paidAmount) !== formatPayPalAmount(resource.price)) {
      throw new Error("Paid amount does not match resource price.");
    }

    const split = calculateSaleSplit(resource.price);

    await prisma.$transaction(async (tx) => {
      await tx.purchase.update({
        where: { id: purchase.id },
        data: {
          status: PurchaseStatus.COMPLETED,
          paypalCaptureId: capture.id,
          amount: paidAmount,
        },
      });

      await tx.sale.create({
        data: {
          purchaseId: purchase.id,
          teacherId: resource.teacherId,
          grossAmount: split.grossAmount,
          platformFee: split.platformFee,
          teacherEarnings: split.teacherEarnings,
        },
      });

      const existingDownload = await tx.download.findFirst({
        where: {
          resourceId: input.resourceId,
          OR: [{ userId: input.userId }, { guestEmail: input.email }],
        },
      });

      if (!existingDownload) {
        await tx.download.create({
          data: {
            userId: input.userId,
            resourceId: input.resourceId,
            pricePaid: paidAmount,
            isFree: false,
          },
        });
      }
    });

    const access = await grantResourceAccess({
      email: input.email,
      resourceId: input.resourceId,
      userId: input.userId,
      pricePaid: paidAmount,
      isFree: false,
    });

    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Chess Platform <onboarding@resend.dev>",
      to: [input.email],
      subject: "Your Chessaz purchase is ready!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d97706;">Payment confirmed</h2>
          <p>Your purchase of <strong>${resource.title}</strong> was successful.</p>
          <p>Platform fee: <strong>$${split.platformFee.toFixed(2)}</strong> (${split.platformFeePercent}%)</p>
          <p>Teacher earnings: <strong>$${split.teacherEarnings.toFixed(2)}</strong></p>
          <p>You can access your file for the next <strong>${access.accessDays} days</strong>.</p>
          <a href="${access.downloadUrl}" style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Download File</a>
        </div>
      `,
    });

    return {
      ok: true as const,
      downloadUrl: access.downloadUrl,
      accessToken: access.accessToken,
      expiresAt: access.expiresAt.toISOString(),
      platformFee: split.platformFee,
      teacherEarnings: split.teacherEarnings,
      message: "Payment completed successfully.",
    };
  } catch (error) {
    console.error("capturePayPalOrderAction error:", error);
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to complete PayPal payment.",
    };
  }
}

export async function getPayPalCheckoutConfigAction() {
  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? process.env.PAYPAL_CLIENT_ID;

  return {
    ok: Boolean(clientId),
    clientId: clientId ?? "",
    platformFeePercent: calculateSaleSplit(100).platformFeePercent,
  };
}
