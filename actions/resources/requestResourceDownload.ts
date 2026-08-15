"use server";

import { getAuthorizedDownloadUrl } from "@/lib/get-authorized-download-url";

export async function requestResourceDownloadAction(
  resourceId: string,
  options?: { userId?: string; email?: string },
) {
  try {
    return await getAuthorizedDownloadUrl(resourceId, options);
  } catch (error) {
    console.error("requestResourceDownloadAction error:", error);
    return { ok: false, message: "Unable to generate download link." };
  }
}
