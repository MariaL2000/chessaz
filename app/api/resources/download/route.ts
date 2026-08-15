import { prisma } from "@/lib/prisma";
import { buildDownloadFilename, fetchSignedResource } from "@/lib/cloudinary";
import {
  getSignedUrlTtlSeconds,
  verifyResourceAccessToken,
} from "@/lib/resource-access-token";

export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get("token");

    if (!token) {
      return Response.json({ error: "Missing access token." }, { status: 401 });
    }

    const payload = verifyResourceAccessToken(token);
    if (!payload) {
      return Response.json(
        { error: "Invalid or expired access token." },
        { status: 401 },
      );
    }

    const guestAccess = await prisma.guestAccess.findUnique({
      where: { id: payload.sub },
      include: {
        resource: {
          select: { id: true, fileUrl: true, title: true },
        },
      },
    });

    if (
      !guestAccess ||
      guestAccess.expiresAt < new Date() ||
      guestAccess.resourceId !== payload.resourceId ||
      guestAccess.email !== payload.email ||
      !guestAccess.resource?.fileUrl
    ) {
      return Response.json(
        { error: "You no longer have access to this resource." },
        { status: 403 },
      );
    }

    const upstream = await fetchSignedResource(
      guestAccess.resource.fileUrl,
      getSignedUrlTtlSeconds(),
    );

    const filename = buildDownloadFilename(
      guestAccess.resource.title,
      guestAccess.resource.fileUrl,
    );

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstream.headers.get("content-type") ?? "application/octet-stream",
    );
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Cache-Control", "private, no-store, max-age=0");
    headers.set("Pragma", "no-cache");
    headers.set("X-Content-Type-Options", "nosniff");

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Resource download API error:", error);
    return Response.json(
      { error: "Unable to process download request." },
      { status: 500 },
    );
  }
}
