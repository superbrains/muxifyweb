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
