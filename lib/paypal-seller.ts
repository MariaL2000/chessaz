import { getPlatformFeePercent } from "@/lib/platform-fees";

export type TeacherPayPalProfile = {
  paypalMerchantId: string | null;
  paypalOnboardingStatus?: string;
  paypalBusinessName?: string | null;
  paypalBusinessEmail?: string | null;
};

export function getPlatformMerchantId(): string | undefined {
  return process.env.PAYPAL_PARTNER_ID?.trim() || undefined;
}

export function isPayPalMarketplaceEnabled(): boolean {
  return process.env.PAYPAL_MARKETPLACE_ENABLED !== "false";
}

export function getPayPalSellerBlockReason(
  profile: TeacherPayPalProfile | null | undefined,
): string | null {
  if (!profile?.paypalMerchantId) {
    return "Connect your PayPal Business account in Profile before selling paid resources.";
  }

  const platformMerchantId = getPlatformMerchantId();
  if (
    platformMerchantId &&
    profile.paypalMerchantId.toUpperCase() === platformMerchantId.toUpperCase()
  ) {
    return "Your PayPal Business account must be different from the Chessaz platform account. Use your own Business account where you want to receive payouts.";
  }

  return null;
}

export function canTeacherSellPaidResources(
  profile: TeacherPayPalProfile | null | undefined,
): boolean {
  return getPayPalSellerBlockReason(profile) === null;
}

export function getPayPalSellerRequirementsSummary() {
  const platformFeePercent = getPlatformFeePercent();
  const marketplaceEnabled = isPayPalMarketplaceEnabled();

  return {
    platformFeePercent,
    marketplaceEnabled,
    requirements: [
      "A PayPal Business account (not Personal) in the same mode as Chessaz (sandbox for testing, live for production).",
      "Your Business Account ID (Merchant ID) saved in Profile — this is where your share of each sale is sent.",
      "The Business account must be different from the Chessaz platform account.",
      marketplaceEnabled
        ? `Automatic split: Chessaz keeps ${platformFeePercent}% as platform fee; the rest goes to your Merchant ID when PayPal marketplace is approved.`
        : `Until marketplace split is active, payments are collected by Chessaz and your ${100 - platformFeePercent}% share is tracked for payout.`,
    ],
    sandboxSteps: [
      "Open PayPal Developer → Sandbox → Accounts.",
      "Create or open a Business sandbox account for the teacher (not the platform account).",
      "Copy Account ID (Merchant ID, e.g. 79GXXGSNMDWES).",
      "Paste it in Profile → PayPal Payouts and add a label (business name / email) so you recognize the account.",
    ],
    onboardingFailureReason:
      "Automatic Connect PayPal fails with NOT_AUTHORIZED until PayPal approves this app as a Commerce Platform partner. In sandbox, use manual Merchant ID connect instead.",
  };
}

export function formatPayoutDestination(profile: TeacherPayPalProfile) {
  const label =
    profile.paypalBusinessName?.trim() ||
    profile.paypalBusinessEmail?.trim() ||
    "Your PayPal Business account";

  return {
    label,
    merchantId: profile.paypalMerchantId,
    businessName: profile.paypalBusinessName,
    businessEmail: profile.paypalBusinessEmail,
  };
}
