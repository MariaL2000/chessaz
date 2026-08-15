import { getPayPalWebhookId, resolvePayPalCaptureDetails } from "@/lib/paypal";

type PayPalWebhookHeaders = {
  transmissionId: string;
  transmissionTime: string;
  transmissionSig: string;
  certUrl: string;
  authAlgo: string;
};

type PayPalWebhookEvent = {
  id: string;
  event_type: string;
  resource: PayPalWebhookResource;
};

type PayPalWebhookResource = {
  id?: string;
  status?: string;
  amount?: {
    value?: string;
    currency_code?: string;
  };
  custom_id?: string;
  supplementary_data?: {
    related_ids?: {
      order_id?: string;
    };
  };
  purchase_units?: Array<{
    custom_id?: string;
    reference_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount?: { value?: string; currency_code?: string };
      }>;
    };
  }>;
};

function getPayPalApiBaseUrl(): string {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalApiBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate with PayPal.");
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export function extractPayPalWebhookHeaders(
  headers: Headers,
): PayPalWebhookHeaders | null {
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const transmissionSig = headers.get("paypal-transmission-sig");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");

  if (
    !transmissionId ||
    !transmissionTime ||
    !transmissionSig ||
    !certUrl ||
    !authAlgo
  ) {
    return null;
  }

  return {
    transmissionId,
    transmissionTime,
    transmissionSig,
    certUrl,
    authAlgo,
  };
}

export async function verifyPayPalWebhookSignature(
  rawBody: string,
  webhookHeaders: PayPalWebhookHeaders,
): Promise<PayPalWebhookEvent> {
  const webhookId = getPayPalWebhookId();
  const webhookEvent = JSON.parse(rawBody) as PayPalWebhookEvent;
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalApiBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: webhookHeaders.authAlgo,
        cert_url: webhookHeaders.certUrl,
        transmission_id: webhookHeaders.transmissionId,
        transmission_sig: webhookHeaders.transmissionSig,
        transmission_time: webhookHeaders.transmissionTime,
        webhook_id: webhookId,
        webhook_event: webhookEvent,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("PayPal webhook verification failed:", errorBody);
    throw new Error("Invalid PayPal webhook signature.");
  }

  const verification = (await response.json()) as {
    verification_status?: string;
  };

  if (verification.verification_status !== "SUCCESS") {
    throw new Error("PayPal webhook signature verification failed.");
  }

  return webhookEvent;
}

export type PayPalCaptureDetails = {
  orderId: string;
  captureId: string;
  paidAmount: number;
  purchaseId?: string;
};

export function extractCaptureFromWebhookEvent(
  event: PayPalWebhookEvent,
): PayPalCaptureDetails | null {
  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const resource = event.resource;
    const orderId = resource.supplementary_data?.related_ids?.order_id;
    const captureId = resource.id;
    const paidAmount = Number(resource.amount?.value ?? 0);

    if (!orderId || !captureId || !paidAmount) {
      return null;
    }

    return {
      orderId,
      captureId,
      paidAmount,
      purchaseId: resource.custom_id,
    };
  }

  if (event.event_type === "CHECKOUT.ORDER.COMPLETED") {
    const purchaseUnit = event.resource.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const orderId = event.resource.id;

    if (!orderId || !capture?.id || capture.status !== "COMPLETED") {
      return null;
    }

    const paidAmount = Number(capture.amount?.value ?? 0);
    if (!paidAmount) {
      return null;
    }

    return {
      orderId,
      captureId: capture.id,
      paidAmount,
      purchaseId: purchaseUnit?.custom_id ?? purchaseUnit?.reference_id,
    };
  }

  return null;
}

export async function capturePayPalOrderFromWebhook(orderId: string) {
  return resolvePayPalCaptureDetails(orderId);
}
