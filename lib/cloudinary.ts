import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Sube un archivo genérico (PDF, PGN, etc.) a Cloudinary
 */
export async function uploadFileToCloudinary(
  fileBase64: string,
  folder: string = "chess_resources/files",
) {
  try {
    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder,
      resource_type: "auto",
      type: "authenticated",
    });
    return { ok: true, url: uploadResponse.secure_url };
  } catch (error) {
    console.error("Error al subir archivo a Cloudinary:", error);
    return { ok: false, url: null };
  }
}

function getDeliveryType(fileUrl: string): "upload" | "authenticated" {
  return fileUrl.includes("/authenticated/") ? "authenticated" : "upload";
}

function getResourceType(fileUrl: string): "image" | "video" | "raw" {
  if (fileUrl.includes("/video/")) return "video";
  if (fileUrl.includes("/raw/")) return "raw";
  return "image";
}

function extractPublicIdFromCloudinaryUrl(fileUrl: string): string {
  if (!fileUrl.includes("res.cloudinary.com")) {
    throw new Error(
      "Unsupported file URL. Resource must be stored in Cloudinary.",
    );
  }

  const parts = new URL(fileUrl).pathname.split("/").filter(Boolean);
  let index = 3;

  while (index < parts.length && !/^v\d+$/.test(parts[index])) {
    index++;
  }

  if (index >= parts.length) {
    throw new Error("Invalid Cloudinary URL: version segment not found.");
  }

  index++;
  const publicId = parts.slice(index).join("/");

  if (!publicId) {
    throw new Error("Invalid Cloudinary URL: public ID not found.");
  }

  return publicId;
}

export function createSignedDownloadUrl(
  fileUrl: string,
  ttlSeconds?: number,
): string {
  const ttl =
    ttlSeconds ??
    Number(process.env.RESOURCE_SIGNED_URL_TTL_SECONDS ?? 300);

  const publicId = extractPublicIdFromCloudinaryUrl(fileUrl);
  const resourceType = getResourceType(fileUrl);
  const deliveryType = getDeliveryType(fileUrl);

  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: deliveryType,
    sign_url: true,
    secure: true,
    expires_at: Math.floor(Date.now() / 1000) + ttl,
  });
}

/**
 * Sube una imagen de vista previa / portada a Cloudinary
 */
export async function uploadImageToCloudinary(
  imageBase64: string,
  folder: string = "chess_resources/previews",
) {
  try {
    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder,
      resource_type: "image",
    });
    return { ok: true, url: uploadResponse.secure_url };
  } catch (error) {
    console.error("Error al subir imagen a Cloudinary:", error);
    return { ok: false, url: null };
  }
}
