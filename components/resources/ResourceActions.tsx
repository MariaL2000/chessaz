"use client";

import React, { useState } from "react";
import { ShoppingCart, Download, Loader2 } from "lucide-react";
import { CustomButton } from "@/components/ui/CustomButton";
import { downloadResourceAction } from "@/actions/resources/downloadResource";

interface ResourceActionsProps {
  slug: string;
  price?: number;
  userRole?: "ADMIN" | "TEACHER" | "STUDENT" | "guest";
}

export const ResourceActions: React.FC<ResourceActionsProps> = ({
  slug,
  price = 0,
  userRole = "guest",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = userRole === "ADMIN";
  const isFree = price === 0;
  const canDownload = isAdmin || isFree;

  const handleAction = async () => {
    if (canDownload) {
      try {
        setIsLoading(true);
        const result = await downloadResourceAction(slug);

        if (result.ok && result.fileUrl) {
          const link = document.createElement("a");
          link.href = result.fileUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.download = `chess-resource-${slug}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert(result.message || "Failed to complete the download.");
        }
      } catch (error) {
        console.error("Download error:", error);
        alert("An unexpected error occurred while downloading.");
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log(`Redirecting to checkout for resource ${slug}...`);
    }
  };

  // ==========================================
  // TODO: CAMBIAR ESTA SECCIÓN PARA EL PAGO
  // ==========================================
  // Aquí debes reemplazar este console.log por:
  // 1. Llamar a tu Server Action o API Route de pago (ej. createCheckoutSession(slug)).
  // 2. Obtener la URL de redirección que te devuelva la pasarela (Stripe/PayPal).
  // 3. Redirigir al usuario: window.location.href = checkoutUrl;

  // Ejemplo futuro de reemplazo:
  // try {
  //   setIsLoading(true);
  //   const { url } = await createStripeCheckoutSession(slug);
  //   if (url) window.location.href = url;
  // } catch (error) {
  //   console.error("Checkout error:", error);
  // } finally {
  //   setIsLoading(false);
  // }

  return (
    <div className="flex items-center gap-3">
      <CustomButton
        variant={canDownload ? "blue" : "gold"}
        onClick={handleAction}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Downloading...
          </>
        ) : canDownload ? (
          <>
            <Download className="w-4 h-4" /> Download
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" /> Buy ${price.toFixed(2)}
          </>
        )}
      </CustomButton>
    </div>
  );
};
