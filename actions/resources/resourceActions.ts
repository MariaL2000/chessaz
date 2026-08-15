"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/client";
import {
  uploadFileToCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { sendResourceReviewNotification } from "@/lib/mail";
import { createResourceSchema, CreateResourceInput } from "@/types/resource";
import {
  getPayPalSellerBlockReason,
} from "@/lib/paypal-seller";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and multiple dashes with a single one
    .replace(/^-+|-+$/g, ""); // Clean leading/trailing dashes
}

export async function createChessResource(data: CreateResourceInput) {
  try {
    const validationResult = createResourceSchema.safeParse(data);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((e) => e.message)
        .join(", ");
      return { ok: false, message: `Validation error: ${errorMessage}` };
    }

    const validatedData = validationResult.data;

    // Ensure main file (PDF) is mandatory
    if (!validatedData.fileBase64) {
      return { ok: false, message: "The main PDF file is required." };
    }

    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      include: { teacherProfile: true },
    });

    if (!user) {
      return { ok: false, message: "User not found in the system." };
    }

    if (user.role !== Role.TEACHER && user.role !== Role.ADMIN) {
      return {
        ok: false,
        message: "You do not have permission to upload resources.",
      };
    }

    let teacherId = user.teacherProfile?.id;

    if (!teacherId) {
      const newTeacherProfile = await prisma.teacherProfile.create({
        data: { userId: user.id },
      });
      teacherId = newTeacherProfile.id;
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      select: {
        paypalMerchantId: true,
        paypalOnboardingStatus: true,
        paypalBusinessName: true,
        paypalBusinessEmail: true,
      },
    });

    if (validatedData.price > 0) {
      const blockReason = getPayPalSellerBlockReason(teacherProfile);
      if (blockReason) {
        return {
          ok: false,
          code: "PAYPAL_REQUIRED",
          message: `${blockReason} Go to Profile → PayPal Payouts, add your Business Merchant ID and a label (business name or email) for the account that should receive your share.`,
        };
      }
    }

    // Upload main file (PDF) to Cloudinary
    const fileUpload = await uploadFileToCloudinary(
      validatedData.fileBase64,
      "chess_resources/files",
    );
    if (!fileUpload.ok || !fileUpload.url) {
      return {
        ok: false,
        message: "Error uploading the main file to Cloudinary.",
      };
    }

    // Handle preview image with a fallback if none is provided
    // En createChessResource, asegúrate de que si falla la subida, use el fallback local:
    let previewUrl = "/fallback.png";
    if (validatedData.previewBase64) {
      const imageUpload = await uploadImageToCloudinary(
        validatedData.previewBase64,
        "chess_resources/previews",
      );
      if (imageUpload.ok && imageUpload.url) {
        previewUrl = imageUpload.url;
      }
    }

    // Generate clean and unique slug with a temporary suffix
    const cleanSlug = generateSlug(validatedData.title);
    const slug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;

    // IF ADMIN, PUBLISH DIRECTLY; IF TEACHER, KEEP PENDING (false)
    const isAdmin = user.role === Role.ADMIN;
    const isPublished = isAdmin ? true : false;

    const newResource = await prisma.resource.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        category: validatedData.category,
        type: validatedData.type,
        minElo: validatedData.minElo,
        maxElo: validatedData.maxElo,
        fileUrl: fileUpload.url,
        previewUrl: previewUrl,
        hasHomework: validatedData.hasHomework,
        price: validatedData.price,
        isPublished: isPublished,
        teacherId: teacherId,
      },
    });

    // If it's a teacher, send an email notification to the administrator
    if (!isAdmin) {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@chezz.com";
      await sendResourceReviewNotification({
        adminEmail,
        teacherName: user.name,
        teacherEmail: user.email,
        resourceTitle: validatedData.title,
        category: validatedData.category,
        type: validatedData.type,
        price: validatedData.price,
      });
    }

    revalidatePath("/dashboard/teacher");
    revalidatePath("/dashboard/admin");
    if (isPublished) {
      revalidatePath("/");
    }

    return {
      ok: true,
      message: isAdmin
        ? "Resource uploaded and published successfully!"
        : "Resource uploaded successfully! It is pending administrator review.",
      resource: newResource,
    };
  } catch (error) {
    console.error("Error creating resource:", error);
    return {
      ok: false,
      message: "An internal server error occurred while processing the upload.",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
