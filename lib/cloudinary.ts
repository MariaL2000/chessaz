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
    });
    return { ok: true, url: uploadResponse.secure_url };
  } catch (error) {
    console.error("Error al subir archivo a Cloudinary:", error);
    return { ok: false, url: null };
  }
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
