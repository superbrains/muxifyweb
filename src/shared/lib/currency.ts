export const formatCurrency = (
  amount: number,
  currency: string = "NGN"
): string => {
  // Naira is the platform's settlement currency, so money defaults to ₦ and the
  // en-NG locale (which renders NGN as the ₦ glyph). Pass a currency explicitly
  // for the rare non-Naira case.
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Formats an amount in Naira (₦). This is the platform's settlement currency, so
 * all artist-facing money on the dashboard should use this rather than the
 * USD-defaulting {@link formatCurrency}.
 *
 * - `compact` (default) → "₦33.7", "₦12.5K", "₦1.2M" — mirrors the backend's
 *   abbreviated stat-card format.
 * - non-compact → "₦33.70", "₦1,250.00" — exact value with thousands separators.
 */
export const formatNaira = (
  amount: number,
  options: { compact?: boolean } = { compact: true }
): string => {
  const n = Number.isFinite(amount) ? amount : 0;

  if (options.compact) {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `₦${parseFloat((n / 1_000_000).toFixed(1))}M`;
    if (abs >= 1_000) return `₦${parseFloat((n / 1_000).toFixed(1))}K`;
    return `₦${parseFloat(n.toFixed(2))}`;
  }

  return `₦${n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};
