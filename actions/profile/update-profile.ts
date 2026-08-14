"use server";

import { prisma } from "@/lib/prisma";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

interface UpdateProfileInput {
  userId: string;
  name?: string;
  imageBase64?: string;
}

export async function updateUserProfile(data: UpdateProfileInput) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      return { ok: false, message: "User not found." };
    }

    let imageUrl = user.image;

    // Upload new image to Cloudinary if provided
    if (data.imageBase64) {
      const uploadRes = await uploadImageToCloudinary(
        data.imageBase64,
        "chess_profiles/avatars",
      );

      if (!uploadRes.ok || !uploadRes.url) {
        return {
          ok: false,
          message: "Error uploading profile image to Cloudinary.",
        };
      }
      imageUrl = uploadRes.url;
    }

    // Update database record
    const updatedUser = await prisma.user.update({
      where: { id: data.userId },
      data: {
        name: data.name !== undefined ? data.name : user.name,
        image: imageUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/dashboard/teacher");

    return {
      ok: true,
      message: "Profile updated successfully!",
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      ok: false,
      message: "A server error occurred while updating the profile.",
    };
  }
}
