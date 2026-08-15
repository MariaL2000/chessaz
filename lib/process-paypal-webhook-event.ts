import { PurchaseStatus } from "@/app/generated/prisma/client";
import {
  findPurchaseForPayPalOrder,
  fulfillPayPalPurchase,
} from "@/lib/fulfill-paypal-purchase";
import {
  capturePayPalOrderFromWebhook,
  extractCaptureFromWebhookEvent,
  type PayPalCaptureDetails,
} from "@/lib/paypal-webhook";
import { prisma } from "@/lib/prisma";
type PayPalWebhookEvent = {
  id: string;
  event_type: string;
  resource: Record<string, unknown>;
};

async function resolvePurchaseId(
  captureDetails: PayPalCaptureDetails,
): Promise<string | null> {
  if (captureDetails.purchaseId) {
    const purchaseById = await prisma.purchase.findUnique({
      where: { id: captureDetails.purchaseId },
      select: { id: true },
    });

    if (purchaseById) {
      return purchaseById.id;
    }
  }

  const purchaseByOrder = await findPurchaseForPayPalOrder(
    captureDetails.orderId,
  );

  return purchaseByOrder?.id ?? null;
}

export async function processPayPalWebhookEvent(event: PayPalWebhookEvent) {
  if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
    const orderId =
      typeof event.resource.id === "string" ? event.resource.id : null;

    if (!orderId) {
      return { handled: false, reason: "Missing order id." };
    }

    const purchase = await findPurchaseForPayPalOrder(orderId);

    if (!purchase) {
      return { handled: false, reason: "No purchase for order." };
    }

    if (purchase.status === PurchaseStatus.COMPLETED) {
      return {
        handled: true,
        eventType: event.event_type,
        purchaseId: purchase.id,
        alreadyFulfilled: true,
      };
    }

    const captureDetails = await capturePayPalOrderFromWebhook(orderId);
    const purchaseId = await resolvePurchaseId(captureDetails);

    if (!purchaseId) {
      return { handled: false, reason: "Purchase not found for approved order." };
    }

    const result = await fulfillPayPalPurchase({
      purchaseId,
      captureId: captureDetails.captureId,
      paidAmount: captureDetails.paidAmount,
    });

    return {
      handled: true,
      eventType: event.event_type,
      purchaseId,
      alreadyFulfilled: result.alreadyFulfilled,
    };
  }

  const captureDetails = extractCaptureFromWebhookEvent(
    event as Parameters<typeof extractCaptureFromWebhookEvent>[0],
  );

  if (!captureDetails) {
    return { handled: false, reason: "Unsupported or incomplete event." };
  }

  const purchaseId = await resolvePurchaseId(captureDetails);

  if (!purchaseId) {
    return { handled: false, reason: "Purchase not found for capture." };
  }

  const result = await fulfillPayPalPurchase({
    purchaseId,
    captureId: captureDetails.captureId,
    paidAmount: captureDetails.paidAmount,
  });

  return {
    handled: true,
    eventType: event.event_type,
    purchaseId,
    alreadyFulfilled: result.alreadyFulfilled,
  };
}
