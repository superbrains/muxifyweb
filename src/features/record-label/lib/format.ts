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
