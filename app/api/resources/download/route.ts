import { prisma } from "@/lib/prisma";
import { createSignedDownloadUrl } from "@/lib/cloudinary";
import { verifyResourceAccessToken, getSignedUrlTtlSeconds } from "@/lib/resource-access-token";

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

    const signedUrl = createSignedDownloadUrl(
      guestAccess.resource.fileUrl,
      getSignedUrlTtlSeconds(),
    );

    return Response.redirect(signedUrl, 302);
  } catch (error) {
    console.error("Resource download API error:", error);
    return Response.json(
      { error: "Unable to process download request." },
      { status: 500 },
    );
  }
}
