import { formatDate, formatDateTime, formatRelativeTime } from '@shared/lib';

const isValid = (iso?: string | null): boolean => {
    if (!iso) return false;
    return !Number.isNaN(new Date(iso).getTime());
};

/** Short date, or an em-dash for missing/invalid values. */
export const adminDate = (iso?: string | null): string =>
    isValid(iso) ? formatDate(iso as string) : '—';

/** Date + time, or an em-dash for missing/invalid values. */
export const adminDateTime = (iso?: string | null): string =>
    isValid(iso) ? formatDateTime(iso as string) : '—';

/** Relative "5m ago" string, or an em-dash for missing/invalid values. */
export const adminRelative = (iso?: string | null): string =>
    isValid(iso) ? formatRelativeTime(iso as string) : '—';

/** ISO date `n` days before today (yyyy-mm-dd) — used for chart ranges. */
export const isoDaysAgo = (n: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
};

export const todayIso = (): string => new Date().toISOString().slice(0, 10);

/** Format an ISO 4217 minor-unit amount, e.g. 12345 NGN => "₦123.45". */
export const formatMinorAmount = (
    amountMinor?: number,
    currency = 'NGN',
): string => {
    const amount = (amountMinor ?? 0) / 100;
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'NGN',
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
};

/** Compact integer formatting, e.g. 1234 => "1,234". */
export const formatCount = (n?: number): string => (n ?? 0).toLocaleString();
