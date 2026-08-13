"use client";

import { useState, ChangeEvent } from "react";
import { updateUserProfile } from "@/actions/profile/update-profile";
import { useAuthStore } from "@/store/useAuthStore";

export function useDashboardAvatar() {
  const [isPending, setIsPending] = useState(false);
  const { user, updateUser } = useAuthStore();

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsPending(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;

      const res = await updateUserProfile({
        userId: user.id,
        imageBase64: base64String,
      });

      if (res.ok && res.user) {
        updateUser({
          image: res.user.image || "",
          name: res.user.name,
        });
      }

      setIsPending(false);
    };

    reader.readAsDataURL(file);
  };

  return {
    isPending,
    handleAvatarUpload,
  };
}
