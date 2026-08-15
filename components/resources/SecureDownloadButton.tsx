"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { requestResourceDownloadAction } from "@/actions/resources/requestResourceDownload";
import { triggerSecureDownload } from "@/lib/trigger-secure-download";

type SecureDownloadButtonProps = {
  resourceId: string;
  userId?: string;
  email?: string;
  className?: string;
  label?: string;
};

export function SecureDownloadButton({
  resourceId,
  userId,
  email,
  className,
  label = "Download File",
}: SecureDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);

    try {
      const result = await requestResourceDownloadAction(resourceId, {
        userId,
        email,
      });

      if (result.ok) {
        await triggerSecureDownload(result.downloadUrl, label);
        return;
      }

      alert(result.message || "Unable to download this resource.");
    } catch (error) {
      console.error(error);
      alert("Unable to download this resource.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isLoading}
      className={
        className ??
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-gold)] text-white text-xs font-bold shadow-xs hover:opacity-90 transition-opacity disabled:opacity-60"
      }
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      {isLoading ? "Preparing..." : label}
    </button>
  );
}
