import { formatPayPalAmount } from "@/lib/platform-fees";

type PayPalAccessTokenResponse = {
  access_token: string;
};

type CreatePayPalOrderInput = {
  purchaseId: string;
  amount: number;
  description: string;
  sellerMerchantId: string;
  platformFee: number;
};

type PartnerReferralInput = {
  trackingId: string;
  returnUrl: string;
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

export function getPayPalPartnerId(): string {
  const partnerId = process.env.PAYPAL_PARTNER_ID;

  if (!partnerId) {
    throw new Error("PAYPAL_PARTNER_ID is not configured.");
  }

  return partnerId;
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

export class PayPalApiError extends Error {
  code: string;
  debugId?: string;
  details?: string;

  constructor(
    message: string,
    code: string,
    debugId?: string,
    details?: string,
  ) {
    super(message);
    this.code = code;
    this.debugId = debugId;
    this.details = details;
  }
}

async function parsePayPalError(response: Response, fallback: string): Promise<never> {
  const errorBody = await response.text();
  console.error("PayPal API error response:", response.status, errorBody);

  if (!errorBody.trim()) {
    throw new PayPalApiError(
      `${fallback} (HTTP ${response.status})`,
      "PAYPAL_ERROR",
      response.headers.get("paypal-debug-id") ?? undefined,
    );
  }

  try {
    const parsed = JSON.parse(errorBody) as {
      name?: string;
      message?: string;
      debug_id?: string;
      details?: Array<{ issue?: string; description?: string }>;
    };

    const details = parsed.details
      ?.map((item) => `${item.issue}: ${item.description}`)
      .join(" | ");

    throw new PayPalApiError(
      parsed.message || fallback,
      parsed.name || "PAYPAL_ERROR",
      parsed.debug_id ?? response.headers.get("paypal-debug-id") ?? undefined,
      details || errorBody.slice(0, 500),
    );
  } catch (error) {
    if (error instanceof PayPalApiError) {
      throw error;
    }

    throw new PayPalApiError(
      fallback,
      "PAYPAL_ERROR",
      response.headers.get("paypal-debug-id") ?? undefined,
      errorBody.slice(0, 500),
    );
  }
}

function buildPayPalAuthAssertion(sellerMerchantId: string): string {
  const { clientId } = getPayPalCredentials();
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString(
    "base64url",
  );
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientId,
      payer_id: sellerMerchantId,
    }),
  ).toString("base64url");

  return `${header}.${payload}.`;
}

function getPayPalRequestHeaders(
  accessToken: string,
  options?: { authAssertion?: string },
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  if (options?.authAssertion) {
    headers["PayPal-Auth-Assertion"] = options.authAssertion;
  }

  const bnCode = process.env.PAYPAL_BN_CODE;
  if (bnCode) {
    headers["PayPal-Partner-Attribution-Id"] = bnCode;
  }

  return headers;
}

async function postPayPalOrder(
  body: Record<string, unknown>,
  authAssertion?: string,
) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${getPayPalApiBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: getPayPalRequestHeaders(accessToken, { authAssertion }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error("PayPal create order error:", response.status);
    await parsePayPalError(response, "Unable to create PayPal order.");
  }

  return (await response.json()) as { id: string };
}

function truncatePayPalDescription(description: string): string {
  return description.length > 127 ? `${description.slice(0, 124)}...` : description;
}

async function createSimplePayPalOrder({
  purchaseId,
  amount,
  description,
}: Omit<CreatePayPalOrderInput, "sellerMerchantId" | "platformFee">) {
  return postPayPalOrder({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: purchaseId,
        description: truncatePayPalDescription(description),
        custom_id: purchaseId,
        amount: {
          currency_code: "USD",
          value: formatPayPalAmount(amount),
        },
      },
    ],
  });
}

async function createMarketplacePayPalOrder({
  purchaseId,
  amount,
  description,
  sellerMerchantId,
  platformFee,
}: CreatePayPalOrderInput) {
  const platformMerchantId = getPayPalPartnerId();
  const authAssertion = buildPayPalAuthAssertion(sellerMerchantId);
  const normalizedPlatformFee = Math.max(platformFee, 0.01);

  return postPayPalOrder(
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: purchaseId,
          description: truncatePayPalDescription(description),
          custom_id: purchaseId,
          amount: {
            currency_code: "USD",
            value: formatPayPalAmount(amount),
          },
          payee: {
            merchant_id: sellerMerchantId,
          },
          payment_instruction: {
            disbursement_mode: "INSTANT",
            platform_fees: [
              {
                amount: {
                  currency_code: "USD",
                  value: formatPayPalAmount(normalizedPlatformFee),
                },
                payee: {
                  merchant_id: platformMerchantId,
                },
              },
            ],
          },
        },
      ],
    },
    authAssertion,
  );
}

export async function createPartnerReferral({
  trackingId,
  returnUrl,
}: PartnerReferralInput): Promise<string> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalApiBaseUrl()}/v2/customer/partner-referrals`,
    {
      method: "POST",
      headers: getPayPalRequestHeaders(accessToken),
      body: JSON.stringify({
        tracking_id: trackingId,
        partner_config_override: {
          return_url: returnUrl,
          return_url_description: "Return to Chessaz",
        },
        operations: [
          {
            operation: "API_INTEGRATION",
            api_integration_preference: {
              rest_api_integration: {
                integration_method: "PAYPAL",
                integration_type: "THIRD_PARTY",
                third_party_details: {
                  features: ["PAYMENT", "REFUND"],
                },
              },
            },
          },
        ],
        products: ["EXPRESS_CHECKOUT"],
        legal_consents: [
          {
            type: "SHARE_DATA_CONSENT",
            granted: true,
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    console.error("PayPal partner referral error:", response.status);
    await parsePayPalError(
      response,
      "Unable to create PayPal onboarding link.",
    );
  }

  const data = (await response.json()) as {
    links?: Array<{ rel: string; href: string }>;
  };

  const actionUrl = data.links?.find(
    (link) => link.rel === "action_url" || link.rel === "approve_url",
  )?.href;

  if (!actionUrl) {
    throw new Error("PayPal onboarding link was not returned.");
  }

  return actionUrl;
}

export async function getSellerMerchantIdByTrackingId(trackingId: string) {
  const accessToken = await getPayPalAccessToken();
  const partnerId = getPayPalPartnerId();

  const response = await fetch(
    `${getPayPalApiBaseUrl()}/v1/customer/partners/${partnerId}/merchant-integrations?tracking_id=${encodeURIComponent(trackingId)}`,
    {
      headers: getPayPalRequestHeaders(accessToken),
    },
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      return null;
    }

    console.error("PayPal merchant integrations error:", response.status);
    await parsePayPalError(
      response,
      "Unable to fetch PayPal merchant integration.",
    );
  }

  const data = (await response.json()) as {
    merchant_id?: string;
    integrations?: Array<{ merchant_id?: string; tracking_id?: string }>;
  };

  if (data.merchant_id) {
    return data.merchant_id;
  }

  const integration = data.integrations?.find(
    (item) => item.tracking_id === trackingId && item.merchant_id,
  );

  return integration?.merchant_id ?? null;
}

export async function createPayPalOrder(
  input: CreatePayPalOrderInput,
): Promise<{ orderId: string; usedMarketplaceSplit: boolean }> {
  const platformMerchantId = getPayPalPartnerId();

  if (input.sellerMerchantId === platformMerchantId) {
    throw new PayPalApiError(
      "Teacher PayPal account must be different from the platform account.",
      "INVALID_PAYEE",
    );
  }

  const marketplaceEnabled = process.env.PAYPAL_MARKETPLACE_ENABLED !== "false";

  if (!marketplaceEnabled) {
    const order = await createSimplePayPalOrder(input);
    return { orderId: order.id, usedMarketplaceSplit: false };
  }

  try {
    const order = await createMarketplacePayPalOrder(input);
    return { orderId: order.id, usedMarketplaceSplit: true };
  } catch (error) {
    const reason =
      error instanceof PayPalApiError
        ? `${error.code}: ${error.details || error.message}`
        : error instanceof Error
          ? error.message
          : String(error);

    console.warn(
      "PayPal marketplace split unavailable, falling back to platform checkout:",
      reason,
    );

    const order = await createSimplePayPalOrder(input);
    return { orderId: order.id, usedMarketplaceSplit: false };
  }
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalApiBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: getPayPalRequestHeaders(accessToken),
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
