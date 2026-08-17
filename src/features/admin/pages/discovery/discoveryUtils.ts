import type { KpiItem, StatusTone } from '@shared/console';
import type { AdminTrendingItemDto } from '../../types/discovery';

/** Tone for each curation action — shared by badges, buttons and the overrides page. */
export const CURATION_TONE: Record<string, StatusTone> = {
    Pin: 'info',
    Boost: 'success',
    Suppress: 'warning',
    Exclude: 'danger',
};

/** Maps a rank delta to a colour + label (▲/▼), shared by RankBadge + detail rows. */
export const rankChangeStyle = (n: number): { color: string; label: string } => {
    if (n > 0) return { color: '#16A34A', label: `▲ ${n}` };
    if (n < 0) return { color: '#E53E3E', label: `▼ ${Math.abs(n)}` };
    return { color: 'gray.400', label: '—' };
};

/**
 * Builds the KPI strip for a trending-family surface. `total` is the page-wide
 * count; `activeOverrides` is the surface-global active override count (from the
 * overrides query). Page-scoped figures are labelled so they read honestly.
 */
export const buildSurfaceKpis = (
    items: AdminTrendingItemDto[],
    total: number,
    activeOverrides: number,
): KpiItem[] => {
    const curatedOnPage = items.filter((i) => i.overrideAction).length;
    const plays = items.reduce((sum, i) => sum + (i.playCount ?? 0), 0);
    const gifts = items.reduce((sum, i) => sum + (i.giftCoins ?? 0), 0);
    return [
        { label: 'Total items', value: total, tone: 'info' },
        { label: 'Active overrides', value: activeOverrides, tone: 'warning' },
        { label: 'Curated · page', value: curatedOnPage, tone: 'success' },
        { label: 'Plays · page', value: plays, tone: 'neutral' },
        { label: 'Gift coins · page', value: gifts, tone: 'neutral' },
    ];
};
