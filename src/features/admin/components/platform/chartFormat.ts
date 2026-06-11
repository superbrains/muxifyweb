import type { Granularity } from '../../types/platform';

/**
 * Axis label for a series bucket. Month buckets carry the year so a 12-month
 * window stays unambiguous; day/week buckets read "Mar 3" like the sibling
 * Growth/Revenue pages.
 */
export const formatBucket = (iso: string, granularity: Granularity = 'day'): string => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    if (granularity === 'month') {
        return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/** Compact count for chart axes — 1.2k / 3.4M instead of long integers. */
export const formatCompact = (n: number): string =>
    new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
        n ?? 0,
    );

/**
 * Compact currency for chart axes — minor units in, "₦1.2M" out. Keeps the
 * currency symbol while staying short enough for a y-axis tick. Falls back to a
 * code-prefixed compact number if the currency isn't recognised by Intl.
 */
export const formatMinorCompact = (amountMinor: number, currency = 'NGN'): string => {
    const amount = (amountMinor ?? 0) / 100;
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'NGN',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(amount);
    } catch {
        return `${currency} ${formatCompact(amount)}`;
    }
};
