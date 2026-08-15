"use server";

import { Role } from "@/app/generated/prisma/client";
import {
  createPartnerReferral,
  getSellerMerchantIdByTrackingId,
  PayPalApiError,
} from "@/lib/paypal";
import {
  canTeacherSellPaidResources,
  getPayPalSellerBlockReason,
  getPayPalSellerRequirementsSummary,
  getPlatformMerchantId,
} from "@/lib/paypal-seller";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const merchantIdSchema = z
  .string()
  .trim()
  .regex(/^[A-Z0-9]{10,20}$/i, "Invalid PayPal Merchant ID format.");

const businessNameSchema = z.string().trim().max(120);
const businessEmailSchema = z.union([
  z.literal(""),
  z.string().trim().email("Enter a valid PayPal business email."),
]);
function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export async function getPayPalConnectionStatusAction(userId: string) {
  try {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: {
        paypalMerchantId: true,
        paypalOnboardingStatus: true,
        paypalBusinessName: true,
        paypalBusinessEmail: true,
      },
    });

    if (!teacherProfile) {
      return {
        ok: false as const,
        message: "Teacher profile not found.",
      };
    }

    const requirements = getPayPalSellerRequirementsSummary();
    const blockReason = getPayPalSellerBlockReason(teacherProfile);

    return {
      ok: true as const,
      status: teacherProfile.paypalOnboardingStatus,
      isConnected: Boolean(teacherProfile.paypalMerchantId),
      canSellPaidResources: canTeacherSellPaidResources(teacherProfile),
      blockReason,
      merchantId: teacherProfile.paypalMerchantId,
      businessName: teacherProfile.paypalBusinessName,
      businessEmail: teacherProfile.paypalBusinessEmail,
      platformMerchantId: getPlatformMerchantId() ?? null,
      platformFeePercent: requirements.platformFeePercent,
      marketplaceEnabled: requirements.marketplaceEnabled,
    };
  } catch (error) {
    console.error("getPayPalConnectionStatusAction error:", error);
    return {
      ok: false as const,
      message: "Unable to load PayPal connection status.",
    };
  }
}

export async function createPayPalOnboardingLinkAction(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || (user.role !== Role.TEACHER && user.role !== Role.ADMIN)) {
      throw new Error("Only teachers can connect PayPal.");
    }

    let teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacherProfile) {
      teacherProfile = await prisma.teacherProfile.create({
        data: { userId },
      });
    }

    if (teacherProfile.paypalMerchantId) {
      return {
        ok: true as const,
        alreadyConnected: true,
        message: "PayPal is already connected.",
      };
    }

    const returnUrl = `${getAppBaseUrl()}/dashboard/teacher?paypal=return`;
    const onboardingUrl = await createPartnerReferral({
      trackingId: teacherProfile.id,
      returnUrl,
    });

    await prisma.teacherProfile.update({
      where: { id: teacherProfile.id },
      data: {
        paypalTrackingId: teacherProfile.id,
        paypalOnboardingStatus: "PENDING",
      },
    });

    return {
      ok: true as const,
      alreadyConnected: false,
      onboardingUrl,
    };
  } catch (error) {
    console.error("createPayPalOnboardingLinkAction error:", error);

    if (error instanceof PayPalApiError && error.code === "NOT_AUTHORIZED") {
      return {
        ok: false as const,
        needsManualConnect: true,
        message:
          "PayPal has not approved marketplace onboarding for this app yet. In sandbox, paste the teacher Business Account ID manually below.",
      };
    }

    return {
      ok: false as const,
      needsManualConnect: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to start PayPal onboarding.",
    };
  }
}

export async function saveTeacherPayPalMerchantIdAction(
  userId: string,
  merchantId: string,
  businessDetails?: {
    businessName?: string;
    businessEmail?: string;
  },
) {
  try {
    const parsedMerchantId = merchantIdSchema.parse(merchantId);
    const parsedBusinessName = businessNameSchema.parse(
      businessDetails?.businessName ?? "",
    );
    const parsedBusinessEmail = businessEmailSchema.parse(
      businessDetails?.businessEmail ?? "",
    );

    if (!parsedBusinessName && !parsedBusinessEmail) {
      return {
        ok: false as const,
        message:
          "Add your PayPal business name or email so you can confirm which account receives payouts.",
      };
    }

    const platformMerchantId = getPlatformMerchantId();
    if (
      platformMerchantId &&
      parsedMerchantId.toUpperCase() === platformMerchantId.toUpperCase()
    ) {
      return {
        ok: false as const,
        message:
          "This Merchant ID belongs to the Chessaz platform account. Paste your own teacher Business Account ID instead.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || (user.role !== Role.TEACHER && user.role !== Role.ADMIN)) {
      throw new Error("Only teachers can connect PayPal.");
    }

    let teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacherProfile) {
      teacherProfile = await prisma.teacherProfile.create({
        data: { userId },
      });
    }

    await prisma.teacherProfile.update({
      where: { id: teacherProfile.id },
      data: {
        paypalMerchantId: parsedMerchantId.toUpperCase(),
        paypalBusinessName: parsedBusinessName || null,
        paypalBusinessEmail: parsedBusinessEmail || null,
        paypalOnboardingStatus: "CONNECTED",
      },
    });

    return {
      ok: true as const,
      merchantId: parsedMerchantId.toUpperCase(),
      message: "PayPal payout account saved. You can now upload paid resources.",
    };
  } catch (error) {
    console.error("saveTeacherPayPalMerchantIdAction error:", error);
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to save PayPal Merchant ID.",
    };
  }
}

export async function syncPayPalMerchantAction(userId: string) {
  try {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacherProfile) {
      throw new Error("Teacher profile not found.");
    }

    const trackingId = teacherProfile.paypalTrackingId ?? teacherProfile.id;
    const merchantId =
      await getSellerMerchantIdByTrackingId(trackingId);

    if (!merchantId) {
      return {
        ok: true as const,
        connected: false,
        needsManualConnect: !process.env.PAYPAL_PARTNER_ID,
        message:
          "Automatic PayPal sync is unavailable. Paste the teacher sandbox Business Account ID manually.",
      };
    }

    await prisma.teacherProfile.update({
      where: { id: teacherProfile.id },
      data: {
        paypalMerchantId: merchantId,
        paypalOnboardingStatus: "CONNECTED",
        paypalTrackingId: trackingId,
      },
    });

    return {
      ok: true as const,
      connected: true,
      merchantId,
      message: "PayPal account connected successfully.",
    };
  } catch (error) {
    console.error("syncPayPalMerchantAction error:", error);
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to sync PayPal merchant account.",
    };
  }
}
