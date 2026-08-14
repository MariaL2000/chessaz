/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";
import { Role } from "@/app/generated/prisma/client";
import { cookies } from "next/headers";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailSchema = z
  .string()
  .email({ message: "Invalid email address format." });

async function verifyEmailExists(email: string): Promise<boolean> {
  try {
    const domain = email.split("@")[1];
    if (!domain) return false;
    const dns = await import("dns").then((m) => m.promises);
    const mxRecords = await dns.resolveMx(domain);
    return Array.isArray(mxRecords) && mxRecords.length > 0;
  } catch (error) {
    console.error("DNS MX validation failed:", error);
    return false;
  }
}

export async function sendOtpCheckoutAction(email: string, resourceId: string) {
  if (!resourceId) {
    return { ok: false, message: "Error: Resource ID is missing." };
  }

  try {
    const validationResult = emailSchema.safeParse(email);
    if (!validationResult.success) {
      const errorMessage =
        validationResult.error.issues[0]?.message || "Invalid email format.";
      throw new Error(errorMessage);
    }

    const domainExists = await verifyEmailExists(email);
    if (!domainExists) {
      throw new Error(
        "Email does not exist or the domain cannot receive mail.",
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.verificationToken.create({
      data: {
        identifier: `${email}_${resourceId}`,
        token: code,
        expires: expiresAt,
      },
    });

    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Chess Platform <onboarding@resend.dev>",
      to: [email],
      subject: "Your Resource Checkout Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Verification Code</h2>
          <p>Your 6-digit checkout confirmation code is:</p>
          <h1 style="color: #d97706; background: #fef3c7; padding: 10px; display: inline-block; border-radius: 6px;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    return { ok: true, message: "Verification code sent to your email." };
  } catch (error: any) {
    return {
      ok: false,
      message: error.message || "Failed to initiate verification.",
    };
  }
}

export async function verifyOtpAndProcessCheckoutAction(
  email: string,
  resourceId: string,
  code: string,
  price: number,
) {
  if (!resourceId) {
    return { ok: false, message: "Error: Resource ID is missing." };
  }

  try {
    const record = await prisma.verificationToken.findFirst({
      where: { identifier: `${email}_${resourceId}`, token: code },
    });

    if (!record || record.expires < new Date()) {
      return { ok: false, message: "Invalid or expired verification code." };
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: `${email}_${resourceId}` },
    });

    // Guardar cookie unificada
    (await cookies()).set("verified_checkout_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    let dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: { email, role: Role.TEACHER },
      });
    }

    if (price === 0) {
      const resourceRecord = await prisma.resource.findUnique({
        where: { id: resourceId },
        select: { title: true, fileUrl: true },
      });

      const rawFileUrl = resourceRecord?.fileUrl || "";

      if (!rawFileUrl) {
        return { ok: false, message: "Resource file URL not found." };
      }

      // Asegurar que la URL sea absoluta y use HTTPS (ideal para Cloudinary o URLs externas)
      let secureCloudinaryUrl = rawFileUrl;
      if (secureCloudinaryUrl.startsWith("http://")) {
        secureCloudinaryUrl = secureCloudinaryUrl.replace(
          "http://",
          "https://",
        );
      } else if (secureCloudinaryUrl.startsWith("/")) {
        // Si por alguna razón se guardó como ruta relativa, la convertimos en absoluta con el dominio actual
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        secureCloudinaryUrl = `${baseUrl}${secureCloudinaryUrl}`;
      }

      await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL ||
          "Chess Platform <onboarding@resend.dev>",
        to: [email],
        subject: "Your secure resource download link is ready!",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d97706;">Thank you for your verification!</h2>
            <p>Your resource <strong>${resourceRecord?.title || "Chess Lesson"}</strong> is ready.</p>
            <p>You can securely download your file by clicking the button below:</p>
            <a href="${secureCloudinaryUrl}" target="_blank" rel="noopener noreferrer" style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 20px 0;">Download File</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #2563eb; word-break: break-all;">${secureCloudinaryUrl}</p>
          </div>
        `,
      });

      return {
        ok: true,
        isFree: true,
        fileUrl: secureCloudinaryUrl,
        message: "Verified! Secure download link sent to your email.",
      };
    }
    return {
      ok: true,
      isFree: false,
      userId: dbUser.id,
      message: "Email verified. Ready for payment checkout.",
    };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      ok: false,
      message: "An error occurred while verifying the code.",
    };
  }
}
