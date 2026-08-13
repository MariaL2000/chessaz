"use client";

import React, { useState } from "react";
import { ShoppingCart, Download, Loader2 } from "lucide-react";
import { CustomButton } from "@/components/ui/CustomButton";
import { downloadResourceAction } from "@/actions/resources/downloadResource";
import { useAuthStore } from "@/store/useAuthStore";

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
  const { user } = useAuthStore(); // Obtenemos el usuario global para extraer su ID

  const isAdmin = userRole === "ADMIN";
  const isFree = price === 0;
  const canDownload = isAdmin || isFree;

  const handleAction = async () => {
    if (canDownload) {
      try {
        setIsLoading(true);
        // Enviamos el slug y el id del usuario actual a la server action
        const result = await downloadResourceAction(slug, user?.id);

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
