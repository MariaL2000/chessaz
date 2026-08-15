export function getPlatformFeePercent(): number {
  const percent = Number(process.env.PLATFORM_FEE_PERCENT ?? 3);

  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    return 3;
  }

  return percent;
}

export function calculateSaleSplit(grossAmount: number) {
  const platformFeePercent = getPlatformFeePercent();
  const platformFee = Number(
    (grossAmount * (platformFeePercent / 100)).toFixed(2),
  );
  const teacherEarnings = Number((grossAmount - platformFee).toFixed(2));

  return {
    platformFeePercent,
    platformFee,
    teacherEarnings,
    grossAmount,
  };
}

export function formatPayPalAmount(amount: number): string {
  return amount.toFixed(2);
}
