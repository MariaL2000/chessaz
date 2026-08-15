"use client";

import { useEffect, useState, useTransition } from "react";
import { createChessResource } from "@/actions/resources/resourceActions";
import { getPayPalConnectionStatusAction } from "@/actions/paypal/paypalOnboardingActions";
import { Loader2, FileText, Image as ImageIcon, AlertCircle } from "lucide-react";
import { ChessCategory, ResourceType, FormDataState } from "@/types/chess";
import { PayPalSellerRequirements } from "@/components/dashboard/PayPalSellerRequirements";

const CATEGORY_LABELS: Record<ChessCategory, string> = {
  OPENINGS: "Openings & Defenses",
  TACTICS: "Tactics & Combinations",
  STRATEGY: "Strategy & Structure",
  ENDGAMES: "Endgames",
  LESSON_PLAN: "Complete Lesson Plan",
};

const TYPE_LABELS: Record<ResourceType, string> = {
  PDF_LESSON: "PDF Guide / Lesson",
  PGN_FILE: "PGN File (Games)",
  WORKSHEET: "Exercises / Homework",
  BUNDLE: "Complete Bundle (PDF + PGN + Homework)",
};

const INITIAL_STATE: FormDataState = {
  title: "",
  description: "",
  category: "OPENINGS",
  type: "PDF_LESSON",
  minElo: 1000,
  maxElo: 1800,
  price: 0,
  hasHomework: false,
  isPublished: false,
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function UploadResourceForm({
  userId,
  onSuccess,
  onGoToProfile,
}: {
  userId: string;
  onSuccess?: () => void;
  onGoToProfile?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isLoadingPayPal, setIsLoadingPayPal] = useState(true);
  const [canSellPaidResources, setCanSellPaidResources] = useState(false);
  const [paypalBlockReason, setPaypalBlockReason] = useState<string | null>(null);
  const [platformFeePercent, setPlatformFeePercent] = useState(3);
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<FormDataState>(INITIAL_STATE);
  const [fileBase64, setFileBase64] = useState<string>("");
  const [previewBase64, setPreviewBase64] = useState<string>("");

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const loadPayPalStatus = async () => {
      setIsLoadingPayPal(true);
      const result = await getPayPalConnectionStatusAction(userId);

      if (!isMounted) return;

      if (result.ok) {
        setCanSellPaidResources(result.canSellPaidResources);
        setPaypalBlockReason(result.blockReason);
        setPlatformFeePercent(result.platformFeePercent);
        setMarketplaceEnabled(result.marketplaceEnabled);
      }

      setIsLoadingPayPal(false);
    };

    loadPayPalStatus();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const isPaidResource = formData.price > 0;
  const paidUploadBlocked = isPaidResource && !canSellPaidResources;

  const handleFileConvert = (
    e: React.ChangeEvent<HTMLInputElement>,
    setBase64: (val: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setMessage({
        type: "error",
        text: "Please choose a smaller file or image (maximum 10 MB).",
      });
      e.target.value = "";
      return;
    }

    setMessage(null);
    const reader = new FileReader();
    reader.onloadend = () => setBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!fileBase64) {
      setMessage({
        type: "error",
        text: "You must attach the main resource file (PDF/PGN).",
      });
      return;
    }

    if (paidUploadBlocked) {
      setMessage({
        type: "error",
        text:
          paypalBlockReason ||
          "Connect your PayPal Business payout account in Profile before uploading paid resources.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await createChessResource({
          ...formData,
          fileBase64,
          previewBase64: previewBase64 || undefined,
          userId,
        });

        if (res.ok) {
          setMessage({ type: "success", text: res.message });
          setFormData(INITIAL_STATE);
          setFileBase64("");
          setPreviewBase64("");
          if (onSuccess) onSuccess();
        } else {
          setMessage({
            type: "error",
            text: res.message || "Error uploading the resource.",
          });
        }
      } catch {
        setMessage({
          type: "error",
          text: "The file exceeds the allowed limit or an unexpected error occurred.",
        });
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-sm space-y-6 md:space-y-8"
    >
      <div className="border-b border-[var(--color-border-custom)] pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-main)]">
          Publish New Resource
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
          Fill in the details below to share your chess training material.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm border transition-all ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400"
              : "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {paidUploadBlocked && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--color-text-main)]">
                PayPal required for paid resources
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {paypalBlockReason ||
                  "Configure your PayPal Business payout account before setting a price above $0."}
              </p>
              {onGoToProfile && (
                <button
                  type="button"
                  onClick={onGoToProfile}
                  className="text-sm font-semibold text-[var(--color-gold)] hover:underline"
                >
                  Go to Profile → PayPal Payouts
                </button>
              )}
            </div>
          </div>
          <PayPalSellerRequirements
            platformFeePercent={platformFeePercent}
            marketplaceEnabled={marketplaceEnabled}
            compact
          />
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-[var(--color-text-main)]">
          Title
        </label>
        <input
          type="text"
          required
          placeholder="e.g., Masterclass on the Sicilian Defense"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-custom)] bg-transparent text-[var(--color-text-main)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-[var(--color-text-main)]">
          Description
        </label>
        <textarea
          rows={4}
          required
          placeholder="Provide a detailed description of what students will learn..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-custom)] bg-transparent text-[var(--color-text-main)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-y"
        />
      </div>

      {/* Category & Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-text-main)]">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as ChessCategory,
              })
            }
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-gold)] transition-colors cursor-pointer"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-text-main)]">
            Resource Type
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as ResourceType })
            }
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-gold)] transition-colors cursor-pointer"
          >
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ELO Ranges & Price */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-text-main)]">
            Minimum ELO
          </label>
          <input
            type="number"
            min="0"
            value={formData.minElo}
            onChange={(e) =>
              setFormData({ ...formData, minElo: Number(e.target.value) })
            }
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-custom)] bg-transparent text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-text-main)]">
            Maximum ELO
          </label>
          <input
            type="number"
            min="0"
            value={formData.maxElo}
            onChange={(e) =>
              setFormData({ ...formData, maxElo: Number(e.target.value) })
            }
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-custom)] bg-transparent text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-text-main)]">
            Price ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.price === 0 ? "" : formData.price}
            placeholder="0.00"
            onChange={(e) =>
              setFormData({
                ...formData,
                price: e.target.value === "" ? 0 : Number(e.target.value),
              })
            }
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-custom)] bg-transparent text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            id="hasHomework"
            checked={formData.hasHomework}
            onChange={(e) =>
              setFormData({ ...formData, hasHomework: e.target.checked })
            }
            className="w-4 h-4 rounded border-[var(--color-border-custom)] text-[var(--color-gold)] focus:ring-[var(--color-gold)] cursor-pointer"
          />
          <span className="text-sm font-medium text-[var(--color-text-main)]">
            Includes exercises / homework
          </span>
        </label>
      </div>

      {/* Files */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-[var(--color-border-custom)]">
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-text-main)]">
            Main File (PDF / PGN)
          </label>
          <label className="flex flex-col sm:flex-row items-center justify-center gap-2 border border-dashed border-[var(--color-border-custom)] p-4 rounded-xl cursor-pointer hover:border-[var(--color-gold)] hover:bg-[var(--color-gold-light)]/20 transition-all text-center sm:text-left">
            <FileText className="w-6 h-6 text-[var(--color-gold)] shrink-0" />
            <span className="text-xs sm:text-sm truncate text-[var(--color-text-main)] font-medium">
              {fileBase64 ? "Main File Loaded ✓" : "Select Main File"}
            </span>
            <input
              type="file"
              accept=".pdf,.pgn"
              hidden
              onChange={(e) => handleFileConvert(e, setFileBase64)}
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-text-main)]">
            Preview / Cover Image
          </label>
          <label className="flex flex-col sm:flex-row items-center justify-center gap-2 border border-dashed border-[var(--color-border-custom)] p-4 rounded-xl cursor-pointer hover:border-[var(--color-gold)] hover:bg-[var(--color-gold-light)]/20 transition-all text-center sm:text-left">
            <ImageIcon className="w-6 h-6 text-[var(--color-gold)] shrink-0" />
            <span className="text-xs sm:text-sm truncate text-[var(--color-text-main)] font-medium">
              {previewBase64 ? "Image Loaded ✓" : "Select Cover Image"}
            </span>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFileConvert(e, setPreviewBase64)}
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || isLoadingPayPal || paidUploadBlocked}
        className="w-full py-3.5 bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-black font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
        {paidUploadBlocked
          ? "Connect PayPal to sell paid resources"
          : "Upload Resource"}
      </button>
    </form>
  );
}
