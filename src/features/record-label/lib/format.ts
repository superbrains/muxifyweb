/**
 * Format an ISO 4217 minor-unit amount into a human-readable currency string.
 * 12345 NGN minor => "₦123.45"
 */
export function formatMinorAmount(amountMinor: number, currency: string): string {
    const amount = (amountMinor ?? 0) / 100;
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
}

export function formatPercentBps(percentBps: number): string {
    return (percentBps / 100).toFixed(2);
}

export function percentBpsFromString(value: string): number {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 100);
}

export interface TrendValue {
    deltaPct: number;
    isPositive: boolean;
}

/**
 * Compute a directional percentage change between a current and previous value.
 * Returns undefined when both sides are zero (no signal to render) or when the
 * previous value is zero and current is also zero. When previous is zero and
 * current is non-zero the chip reads "100%" — better than the unbounded "+∞%"
 * we'd get from a naive division.
 */
export function formatTrend(current: number, previous: number): TrendValue | undefined {
    if (previous === 0 && current === 0) return undefined;
    if (previous === 0) return { deltaPct: 100, isPositive: current > 0 };
    const delta = ((current - previous) / Math.abs(previous)) * 100;
    return { deltaPct: Math.abs(delta), isPositive: delta >= 0 };
}
