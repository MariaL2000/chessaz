import { processPayPalWebhookEvent } from "@/lib/process-paypal-webhook-event";
import {
  extractPayPalWebhookHeaders,
  verifyPayPalWebhookSignature,
} from "@/lib/paypal-webhook";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const webhookHeaders = extractPayPalWebhookHeaders(request.headers);

    if (!webhookHeaders) {
      return Response.json(
        { error: "Missing PayPal webhook headers." },
        { status: 400 },
      );
    }

    const event = await verifyPayPalWebhookSignature(rawBody, webhookHeaders);
    const result = await processPayPalWebhookEvent(event);

    console.info("PayPal webhook processed:", {
      eventId: event.id,
      eventType: event.event_type,
      result,
    });

    return Response.json({ received: true, ...result });
  } catch (error) {
    console.error("PayPal webhook error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process PayPal webhook.",
      },
      { status: 400 },
    );
  }
}
