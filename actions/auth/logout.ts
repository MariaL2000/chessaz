"use server";

import { signOut } from "@/auth.config";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function logoutUser() {
  try {
    await signOut({ redirectTo: "/login" });
  } catch (error) {
    // Relanzar la redirección interna de Next.js hacia /login
    if (
      isRedirectError(error) ||
      (error as Error).message?.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Error in logout:", error);
    return { error: "An error occurred while signing out" };
  }
}
