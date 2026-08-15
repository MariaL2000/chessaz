"use client";

import { useEffect, useState } from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import {
  capturePayPalOrderAction,
  createPayPalOrderAction,
  getPayPalCheckoutConfigAction,
} from "@/actions/checkout/paypalCheckoutActions";

type PayPalCheckoutProps = {
  resourceId: string;
  userId: string;
  email: string;
  price: number;
  onSuccess: (result: {
    downloadUrl: string;
    accessToken?: string;
    expiresAt?: string;
  }) => void;
  onError: (message: string) => void;
};

export function PayPalCheckout({
  resourceId,
  userId,
  email,
  price,
  onSuccess,
  onError,
}: PayPalCheckoutProps) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [platformFeePercent, setPlatformFeePercent] = useState(3);
  const [feePreview, setFeePreview] = useState({
    platformFee: 0,
    teacherEarnings: price,
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      const config = await getPayPalCheckoutConfigAction();

      if (!isMounted) return;

      if (!config.ok || !config.clientId) {
        onError("PayPal is not configured yet.");
        setIsBootstrapping(false);
        return;
      }

      setClientId(config.clientId);
      setPlatformFeePercent(config.platformFeePercent);
      setFeePreview({
        platformFee: Number((price * (config.platformFeePercent / 100)).toFixed(2)),
        teacherEarnings: Number(
          (price - price * (config.platformFeePercent / 100)).toFixed(2),
        ),
      });
      setIsBootstrapping(false);
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, [onError, price]);

  if (isBootstrapping) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--color-gold)]" />
      </div>
    );
  }

  if (!clientId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-bg-beige-dark)] p-3 text-left text-xs text-[var(--color-text-muted)]">
        <p>
          Total:{" "}
          <strong className="text-[var(--color-text-main)]">
            ${price.toFixed(2)}
          </strong>
        </p>
        <p>
          Platform fee ({platformFeePercent}%):{" "}
          <strong className="text-[var(--color-text-main)]">
            ${feePreview.platformFee.toFixed(2)}
          </strong>
        </p>
        <p>
          Teacher receives:{" "}
          <strong className="text-[var(--color-text-main)]">
            ${feePreview.teacherEarnings.toFixed(2)}
          </strong>
        </p>
      </div>

      <PayPalScriptProvider
        options={{
          clientId,
          currency: "USD",
          intent: "capture",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect", label: "paypal" }}
          createOrder={async () => {
            const result = await createPayPalOrderAction({
              resourceId,
              userId,
              email,
            });

            if (!result.ok) {
              onError(result.message);
              throw new Error(result.message);
            }

            return result.orderId;
          }}
          onApprove={async (data) => {
            const result = await capturePayPalOrderAction({
              resourceId,
              userId,
              email,
              orderId: data.orderID,
            });

            if (!result.ok) {
              onError(result.message);
              throw new Error(result.message);
            }

            onSuccess({
              downloadUrl: result.downloadUrl,
              accessToken: result.accessToken,
              expiresAt: result.expiresAt,
            });
          }}
          onError={() => {
            onError("PayPal checkout was cancelled or failed.");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
