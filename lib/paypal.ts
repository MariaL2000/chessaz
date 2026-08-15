import { formatPayPalAmount } from "@/lib/platform-fees";

type PayPalAccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type CreatePayPalOrderInput = {
  purchaseId: string;
  amount: number;
  description: string;
};

function getPayPalApiBaseUrl(): string {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured.");
  }

  return { clientId, clientSecret };
}

async function getPayPalAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getPayPalCredentials();
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

  const data = (await response.json()) as PayPalAccessTokenResponse;
  return data.access_token;
}

export async function createPayPalOrder({
  purchaseId,
  amount,
  description,
}: CreatePayPalOrderInput): Promise<string> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${getPayPalApiBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: purchaseId,
          description,
          custom_id: purchaseId,
          amount: {
            currency_code: "USD",
            value: formatPayPalAmount(amount),
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("PayPal create order error:", errorBody);
    throw new Error("Unable to create PayPal order.");
  }

  const data = (await response.json()) as { id: string };
  return data.id;
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalApiBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("PayPal capture order error:", errorBody);
    throw new Error("Unable to capture PayPal payment.");
  }

  return response.json() as Promise<{
    id: string;
    status: string;
    purchase_units: Array<{
      reference_id?: string;
      payments?: {
        captures?: Array<{
          id: string;
          status: string;
          amount?: {
            currency_code?: string;
            value?: string;
          };
        }>;
      };
    }>;
  }>;
}

export function getPayPalClientId(): string {
  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? process.env.PAYPAL_CLIENT_ID;

  if (!clientId) {
    throw new Error("PayPal client ID is not configured.");
  }

  return clientId;
}
