"use client";

type PayPalSellerRequirementsProps = {
  platformFeePercent: number;
  marketplaceEnabled: boolean;
  compact?: boolean;
};

export function PayPalSellerRequirements({
  platformFeePercent,
  marketplaceEnabled,
  compact = false,
}: PayPalSellerRequirementsProps) {
  const teacherShare = 100 - platformFeePercent;

  if (compact) {
    return (
      <ul className="list-disc pl-5 space-y-1 text-xs text-[var(--color-text-muted)]">
        <li>PayPal Business account required to sell paid resources.</li>
        <li>
          Payout destination: your Business Merchant ID ({teacherShare}% after
          platform fee).
        </li>
        <li>Must be a different account from the Chessaz platform account.</li>
      </ul>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-bg-beige-dark)]/60 p-4 space-y-3 text-sm">
      <p className="font-semibold text-[var(--color-text-main)]">
        What you need to receive payments
      </p>
      <ul className="list-disc pl-5 space-y-2 text-[var(--color-text-muted)]">
        <li>
          A <strong className="text-[var(--color-text-main)]">PayPal Business</strong>{" "}
          account (sandbox for testing, live for production).
        </li>
        <li>
          Your <strong className="text-[var(--color-text-main)]">Business Account ID</strong>{" "}
          (Merchant ID) — this tells Chessaz where to send your{" "}
          <strong className="text-[var(--color-text-main)]">{teacherShare}%</strong>{" "}
          after the {platformFeePercent}% platform fee.
        </li>
        <li>
          A label (business name or PayPal email) so you can confirm it is{" "}
          <em>your</em> account, not the platform account.
        </li>
        <li>
          The teacher account must{" "}
          <strong className="text-[var(--color-text-main)]">not</strong> be the
          same Merchant ID as Chessaz.
        </li>
      </ul>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-[var(--color-text-main)]">
        <p className="font-semibold">Why automatic connect may fail</p>
        <p className="mt-1 text-[var(--color-text-muted)]">
          PayPal returns NOT_AUTHORIZED until the app is approved as a Commerce
          Platform partner. In sandbox, paste your teacher Business Account ID
          manually (Developer → Sandbox → Accounts → View account → Account ID).
        </p>
      </div>

      {!marketplaceEnabled && (
        <p className="text-xs text-[var(--color-text-muted)]">
          Marketplace split is currently disabled — checkout may route through
          the platform account while your earnings are tracked in Chessaz.
        </p>
      )}
    </div>
  );
}
