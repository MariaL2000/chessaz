"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Link2, CheckCircle2, AlertCircle, Wallet } from "lucide-react";
import {
  createPayPalOnboardingLinkAction,
  getPayPalConnectionStatusAction,
  saveTeacherPayPalMerchantIdAction,
  syncPayPalMerchantAction,
} from "@/actions/paypal/paypalOnboardingActions";
import { PayPalSellerRequirements } from "@/components/dashboard/PayPalSellerRequirements";

type PayPalConnectCardProps = {
  userId: string;
  autoSync?: boolean;
};

export function PayPalConnectCard({
  userId,
  autoSync = false,
}: PayPalConnectCardProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState("NOT_CONNECTED");
  const [isConnected, setIsConnected] = useState(false);
  const [canSellPaidResources, setCanSellPaidResources] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const [platformFeePercent, setPlatformFeePercent] = useState(3);
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [manualMerchantId, setManualMerchantId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [savedMerchantId, setSavedMerchantId] = useState<string | null>(null);
  const [showManualConnect, setShowManualConnect] = useState(false);

  const applyStatus = (result: Extract<
    Awaited<ReturnType<typeof getPayPalConnectionStatusAction>>,
    { ok: true }
  >) => {
    setStatus(result.status);
    setIsConnected(result.isConnected);
    setCanSellPaidResources(result.canSellPaidResources);
    setBlockReason(result.blockReason);
    setPlatformFeePercent(result.platformFeePercent);
    setMarketplaceEnabled(result.marketplaceEnabled);
    setSavedMerchantId(result.merchantId);
    if (result.merchantId) {
      setManualMerchantId(result.merchantId);
    }
    if (result.businessName) {
      setBusinessName(result.businessName);
    }
    if (result.businessEmail) {
      setBusinessEmail(result.businessEmail);
    }
  };

  const loadStatus = () => {
    startTransition(async () => {
      const result = await getPayPalConnectionStatusAction(userId);

      if (result.ok) {
        applyStatus(result);
      } else {
        setMessage(result.message);
      }
    });
  };

  useEffect(() => {
    loadStatus();
  }, [userId]);

  useEffect(() => {
    if (!autoSync || !userId) return;

    startTransition(async () => {
      const syncResult = await syncPayPalMerchantAction(userId);

      if (syncResult.ok) {
        if (syncResult.connected) {
          setMessage(syncResult.message);
          setIsConnected(true);
          setStatus("CONNECTED");
        } else {
          setMessage(syncResult.message);
          setShowManualConnect(true);
        }
        loadStatus();
      } else {
        setMessage(syncResult.message);
        setShowManualConnect(true);
      }
    });
  }, [autoSync, userId]);

  const handleConnect = () => {
    setMessage(null);

    startTransition(async () => {
      const result = await createPayPalOnboardingLinkAction(userId);

      if (!result.ok) {
        setMessage(result.message);
        if ("needsManualConnect" in result && result.needsManualConnect) {
          setShowManualConnect(true);
        }
        return;
      }

      if (result.alreadyConnected) {
        setIsConnected(true);
        setStatus("CONNECTED");
        setMessage(result.message);
        loadStatus();
        return;
      }

      window.location.href = result.onboardingUrl;
    });
  };

  const handleManualSave = () => {
    setMessage(null);

    startTransition(async () => {
      const result = await saveTeacherPayPalMerchantIdAction(
        userId,
        manualMerchantId,
        { businessName, businessEmail },
      );

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setMessage(result.message);
      setIsConnected(true);
      setStatus("CONNECTED");
      setCanSellPaidResources(true);
      setBlockReason(null);
      setSavedMerchantId(result.merchantId);
      setShowManualConnect(false);
      loadStatus();
    });
  };

  const handleRefresh = () => {
    setMessage(null);

    startTransition(async () => {
      const syncResult = await syncPayPalMerchantAction(userId);

      if (!syncResult.ok) {
        setMessage(syncResult.message);
        setShowManualConnect(true);
        return;
      }

      setMessage(syncResult.message);
      setIsConnected(syncResult.connected);
      setStatus(syncResult.connected ? "CONNECTED" : "PENDING");

      if (!syncResult.connected) {
        setShowManualConnect(true);
      }

      loadStatus();
    });
  };

  const teacherShare = 100 - platformFeePercent;

  return (
    <div className="rounded-2xl border border-[var(--color-border-custom)] bg-[var(--color-bg-card)] p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text-main)]">
            PayPal Payouts
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Required to sell paid resources. Students pay through Chessaz; your
            share ({teacherShare}%) is sent to the Business account you configure
            below.
          </p>
        </div>
        {canSellPaidResources ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
        ) : (
          <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
        )}
      </div>

      <PayPalSellerRequirements
        platformFeePercent={platformFeePercent}
        marketplaceEnabled={marketplaceEnabled}
      />

      <div className="rounded-xl bg-[var(--color-bg-beige-dark)] px-4 py-3 text-sm space-y-1">
        <p className="text-[var(--color-text-muted)]">Connection status</p>
        <p className="font-semibold text-[var(--color-text-main)]">
          {canSellPaidResources
            ? "Ready to sell paid resources"
            : isConnected
              ? "Connected but not valid for payouts"
              : status.replaceAll("_", " ")}
        </p>
        {blockReason && (
          <p className="text-xs text-amber-700 dark:text-amber-400">{blockReason}</p>
        )}
      </div>

      {canSellPaidResources && savedMerchantId && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Wallet className="w-4 h-4" />
            <p className="text-sm font-semibold">Where your money goes</p>
          </div>
          <dl className="grid gap-2 text-sm">
            {(businessName || businessEmail) && (
              <div>
                <dt className="text-[var(--color-text-muted)]">Business account</dt>
                <dd className="font-medium text-[var(--color-text-main)]">
                  {businessName}
                  {businessName && businessEmail ? " · " : ""}
                  {businessEmail}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-[var(--color-text-muted)]">PayPal Merchant ID</dt>
              <dd className="font-mono text-xs sm:text-sm text-[var(--color-text-main)] break-all">
                {savedMerchantId}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)]">Your share per sale</dt>
              <dd className="font-medium text-[var(--color-text-main)]">
                {teacherShare}% (Chessaz keeps {platformFeePercent}% platform fee)
              </dd>
            </div>
          </dl>
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-gold-light)]/40 px-4 py-3 text-sm text-[var(--color-text-main)]">
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!isConnected && (
          <button
            type="button"
            onClick={handleConnect}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-gold)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            Connect PayPal (automatic)
          </button>
        )}

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-custom)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-main)] hover:bg-[var(--color-gold-light)]/30 disabled:opacity-60"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Refresh status
        </button>
      </div>

      {(showManualConnect || !canSellPaidResources) && (
        <div className="rounded-xl border border-dashed border-[var(--color-border-custom)] p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-main)]">
              Configure payout account
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Paste your teacher PayPal Business Account ID and add a label so
              you can verify it is your account (not the Chessaz platform
              account). Sandbox: Developer → Sandbox → Accounts → View account →
              Account ID.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[var(--color-text-main)]">
                Business name (label)
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="e.g. GM García Academy"
                className="w-full rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-bg-beige-dark)] px-3 py-2.5 text-sm text-[var(--color-text-main)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[var(--color-text-main)]">
                PayPal business email
              </label>
              <input
                type="email"
                value={businessEmail}
                onChange={(event) => setBusinessEmail(event.target.value)}
                placeholder="teacher-business@example.com"
                className="w-full rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-bg-beige-dark)] px-3 py-2.5 text-sm text-[var(--color-text-main)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-[var(--color-text-main)]">
              Business Account ID (Merchant ID)
            </label>
            <input
              type="text"
              value={manualMerchantId}
              onChange={(event) => setManualMerchantId(event.target.value)}
              placeholder="Example: 79GXXGSNMDWES"
              className="w-full rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-bg-beige-dark)] px-3 py-2.5 text-sm font-mono text-[var(--color-text-main)]"
            />
          </div>

          <button
            type="button"
            onClick={handleManualSave}
            disabled={
              isPending ||
              !manualMerchantId.trim() ||
              (!businessName.trim() && !businessEmail.trim())
            }
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-blue)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save payout account
          </button>
        </div>
      )}
    </div>
  );
}
