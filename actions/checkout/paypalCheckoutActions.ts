"use server";

import { cookies } from "next/headers";
import { PurchaseStatus } from "@/app/generated/prisma/client";
import { fulfillPayPalPurchase } from "@/lib/fulfill-paypal-purchase";
import { getCompletedPurchaseAccess } from "@/lib/existing-purchase-access";
import { calculateSaleSplit } from "@/lib/platform-fees";
import { createPayPalOrder, resolvePayPalCaptureDetails } from "@/lib/paypal";
import { getPayPalSellerBlockReason } from "@/lib/paypal-seller";
import { prisma } from "@/lib/prisma";
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

  return resource;
}

export async function getExistingPurchaseAccessAction(input: CheckoutIdentity) {
  try {
    const verifiedEmail = (await cookies()).get("verified_checkout_email")?.value;

    if (
      !verifiedEmail ||
      verifiedEmail.toLowerCase() !== input.email.toLowerCase()
    ) {
      return { ok: false as const, message: "Email verification is required." };
    }

    const access = await getCompletedPurchaseAccess(input);

    if (!access) {
      return { ok: true as const, alreadyPurchased: false as const };
    }

    return {
      ok: true as const,
      alreadyPurchased: true as const,
      downloadUrl: access.downloadUrl,
      accessToken: access.accessToken,
      expiresAt: access.expiresAt,
      message: "You already purchased this resource.",
    };
  } catch (error) {
    console.error("getExistingPurchaseAccessAction error:", error);
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to check purchase status.",
    };
  }
}

export async function createPayPalOrderAction(input: CheckoutIdentity) {
  try {
    const existingAccess = await getCompletedPurchaseAccess(input);

    if (existingAccess) {
      return {
        ok: true as const,
        alreadyPurchased: true as const,
        downloadUrl: existingAccess.downloadUrl,
        accessToken: existingAccess.accessToken,
        expiresAt: existingAccess.expiresAt,
        message: "You already purchased this resource.",
      };
    }

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
    const existingAccess = await getCompletedPurchaseAccess(input);

    if (existingAccess) {
      return {
        ok: true as const,
        downloadUrl: existingAccess.downloadUrl,
        accessToken: existingAccess.accessToken,
        expiresAt: existingAccess.expiresAt,
        message: "You already purchased this resource.",
      };
    }

    await validateCheckoutIdentity(input);

    const purchase = await prisma.purchase.findFirst({
      where: {
        paypalOrderId: input.orderId,
        userId: input.userId,
        resourceId: input.resourceId,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!purchase) {
      throw new Error("Purchase not found for this PayPal order.");
    }

    if (purchase.status === PurchaseStatus.COMPLETED && purchase.paypalCaptureId) {
      const result = await fulfillPayPalPurchase({
        purchaseId: purchase.id,
        captureId: purchase.paypalCaptureId,
        paidAmount: purchase.amount,
        sendConfirmationEmail: false,
      });

      return {
        ok: true as const,
        downloadUrl: result.downloadUrl ?? "",
        accessToken: result.accessToken,
        expiresAt: result.expiresAt,
        platformFee: result.platformFee,
        teacherEarnings: result.teacherEarnings,
        message: "Payment was already completed.",
      };
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new Error("Purchase is not pending payment.");
    }

    const captureDetails = await resolvePayPalCaptureDetails(input.orderId);

    const result = await fulfillPayPalPurchase({
      purchaseId: purchase.id,
      captureId: captureDetails.captureId,
      paidAmount: captureDetails.paidAmount,
    });

    return {
      ok: true as const,
      downloadUrl: result.downloadUrl ?? "",
      accessToken: result.accessToken,
      expiresAt: result.expiresAt,
      platformFee: result.platformFee,
      teacherEarnings: result.teacherEarnings,
      message: result.alreadyFulfilled
        ? "Payment was already completed."
        : "Payment completed successfully.",
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
