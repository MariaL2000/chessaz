"use client";

import React, { useState } from "react";
import {
  Loader2,
  Mail,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import { CustomButton } from "@/components/ui/CustomButton";
import {
  sendOtpCheckoutAction,
  verifyOtpAndProcessCheckoutAction,
} from "@/actions/checkout/resourceCheckoutActions";
import { useGuestStore } from "@/store/useGuestStore"; // <--- 1. Importa tu store de Zustand

interface ResourceCheckoutModalProps {
  resourceId: string;
  slug: string;
  price: number;
  title: string;
  onClose?: () => void;
}

export const ResourceCheckoutModal: React.FC<ResourceCheckoutModalProps> = ({
  resourceId,
  price,
  title,
}) => {
  const [step, setStep] = useState<"email" | "otp" | "success" | "payment">(
    "email",
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 2. Extrae la función verifyResource del store global
  const verifyResource = useGuestStore((state) => state.verifyResource);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceId) {
      setErrorMessage("Resource ID is missing.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await sendOtpCheckoutAction(email, resourceId);
    setIsLoading(false);

    if (res.ok) {
      setStep("otp");
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceId) {
      setErrorMessage("Resource ID is missing.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await verifyOtpAndProcessCheckoutAction(
      email,
      resourceId,
      otp,
      price,
    );

    setIsLoading(false);

    if (res.ok) {
      setSuccessMessage(res.message);

      // 3. ACTUALIZA ZUSTAND AQUÍ: Guarda el estado de verificación para este recurso y email
      verifyResource(resourceId, email);

      if (price === 0) {
        setStep("success");
      } else {
        setStep("payment");
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-custom)] rounded-2xl p-6 shadow-sm w-full space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--color-border-custom)] pb-3">
        <h3 className="font-bold text-base text-[var(--color-text-main)]">
          {price === 0
            ? "Free Resource Access"
            : `Checkout - $${price.toFixed(2)}`}
        </h3>
        <span className="text-xs text-[var(--color-text-muted)] truncate max-w-[180px]">
          {title}
        </span>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs rounded-xl">
          {errorMessage}
        </div>
      )}

      {step === "email" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
              Enter your email to verify and proceed
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-bg-beige-dark)] border border-[var(--color-border-custom)] rounded-xl text-xs text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
              />
            </div>
          </div>

          <CustomButton
            type="submit"
            variant="gold"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Continue with Email"
            )}
          </CustomButton>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
              Enter the 6-digit code sent to{" "}
              <span className="font-bold text-[var(--color-text-main)]">
                {email}
              </span>
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full px-3 py-2.5 text-center tracking-widest text-lg font-bold bg-[var(--color-bg-beige-dark)] border border-[var(--color-border-custom)] rounded-xl text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
            />
          </div>

          <CustomButton
            type="submit"
            variant="gold"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Verify Code & Complete"
            )}
          </CustomButton>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="w-full text-center text-xs text-[var(--color-text-muted)] hover:underline"
          >
            Change email address
          </button>
        </form>
      )}

      {step === "success" && (
        <div className="text-center py-6 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-sm text-[var(--color-text-main)]">
            Verification Successful!
          </h4>
          <p className="text-xs text-[var(--color-text-muted)]">
            {successMessage}
          </p>
        </div>
      )}

      {step === "payment" && (
        <div className="text-center py-6 space-y-4">
          <CreditCard className="w-12 h-12 text-[var(--color-gold)] mx-auto" />
          <h4 className="font-bold text-sm text-[var(--color-text-main)]">
            Email Verified Successfully
          </h4>
          <p className="text-xs text-[var(--color-text-muted)]">
            {successMessage} Proceed with your secure payment gateway.
          </p>
          <CustomButton
            type="button"
            variant="gold"
            className="w-full"
            onClick={() => {
              alert("Integrating payment gateway for: " + email);
            }}
          >
            Pay ${price.toFixed(2)} with PayPal
          </CustomButton>
        </div>
      )}

      <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border-custom)]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>
          Strict validation ensures verified deliverability via Resend.
        </span>
      </div>
    </div>
  );
};
