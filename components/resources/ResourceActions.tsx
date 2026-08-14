"use client";

import React, { useState } from "react";
import { ShoppingCart, Download, Loader2 } from "lucide-react";
import { CustomButton } from "@/components/ui/CustomButton";
import { downloadResourceAction } from "@/actions/resources/downloadResource";
import { useAuthStore } from "@/store/useAuthStore";
import { useGuestStore } from "@/store/useGuestStore";
import { ResourceCheckoutModal } from "@/components/resources/ResourceCheckoutModal";

interface ResourceActionsProps {
  slug: string;
  resourceId: string;
  title: string;
  price?: number;
  userRole?: "ADMIN" | "TEACHER" | "guest";
  fileUrl?: string;
}

export const ResourceActions: React.FC<ResourceActionsProps> = ({
  slug,
  resourceId,
  title,
  price = 0,
  userRole = "guest",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { user } = useAuthStore();

  const isVerifiedGuest = useGuestStore((state) =>
    state.isVerified(resourceId),
  );

  const isAdmin = userRole === "ADMIN";

  // MODIFICACIÓN: Solo los administradores descargan de forma directa sin pasar por checkout/OTP.
  // Los teachers (aunque estén logueados) y los invitados pasarán por el modal de verificación.
  const canDownloadDirectly = isAdmin;

  const handleAction = async () => {
    if (canDownloadDirectly) {
      try {
        setIsLoading(true);
        const result = await downloadResourceAction(slug, user?.id);
        if (result.ok && result.fileUrl) {
          window.open(result.fileUrl, "_blank");
        } else {
          alert(result.message || "Failed to download.");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowCheckout(true);
    }
  };

  if (showCheckout) {
    return (
      <ResourceCheckoutModal
        resourceId={resourceId}
        slug={slug}
        price={price}
        title={title}
        onClose={() => setShowCheckout(false)}
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <CustomButton
        variant={isAdmin ? "blue" : "gold"}
        onClick={handleAction}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
          </>
        ) : (
          <>
            {isAdmin ? (
              <Download className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            {isAdmin
              ? " Download"
              : isVerifiedGuest
                ? " Access Verified (Check Email)"
                : price === 0
                  ? " Get Free (Verify Email)"
                  : ` Buy $${price.toFixed(2)}`}
          </>
        )}
      </CustomButton>
    </div>
  );
};
