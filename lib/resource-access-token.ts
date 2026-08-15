import { createHmac, timingSafeEqual } from "crypto";

export type ResourceAccessPayload = {
  sub: string;
  resourceId: string;
  email: string;
  exp: number;
};

export function getResourceAccessDays(): number {
  const days = Number(process.env.RESOURCE_ACCESS_DAYS ?? 7);
  return Number.isFinite(days) && days > 0 ? days : 7;
}

export function getSignedUrlTtlSeconds(): number {
  const ttl = Number(process.env.RESOURCE_SIGNED_URL_TTL_SECONDS ?? 300);
  return Number.isFinite(ttl) && ttl > 0 ? ttl : 300;
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required for resource access tokens.");
  }
  return secret;
}

export function signResourceAccessToken(
  payload: Omit<ResourceAccessPayload, "exp">,
  expiresAt: Date,
): string {
  const fullPayload: ResourceAccessPayload = {
    ...payload,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };

  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

export function verifyResourceAccessToken(
  token: string,
): ResourceAccessPayload | null {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expectedSignature = createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8"),
    ) as ResourceAccessPayload;

    if (!payload.sub || !payload.resourceId || !payload.email || !payload.exp) {
      return null;
    }

    if (payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function buildResourceDownloadUrl(accessToken: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  return `${baseUrl}/api/resources/download?token=${encodeURIComponent(accessToken)}`;
}
