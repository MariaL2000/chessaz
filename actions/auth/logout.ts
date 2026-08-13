"use server";

import { signOut } from "@/auth.config";

export async function logoutUser() {
  try {
    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    console.error("Error in logout:", error);
    return { error: "An error occurred while signing out" };
  }
}
