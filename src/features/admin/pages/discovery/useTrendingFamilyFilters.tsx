import type { SelectFilter } from '../../components/ui';
import {
    CREATOR_CATEGORY_OPTIONS,
    DISCOVERY_VERTICAL_OPTIONS,
    VIDEO_TYPE_OPTIONS,
} from '../../types/discovery';
import type { DiscoveryItemsController } from './useDiscoveryItems';

interface TrendingFamilyFilterOpts {
    /** When provided, include a period select (Trending / Top Charts). Hot/New use a day window instead. */
    period?: { options: { value: string; label: string }[] };
}

/**
 * Builds the shared filter row for the four trending-family Discovery pages so each mirrors the
 * mobile feed params: a vertical toggle (music tracks vs videos), a creator-category selector
 * (the mobile home tabs), an optional period select, and — on the video vertical — the music/content
 * video-segment filter. Switching vertical resets the video segment and the page index.
 */
export const useTrendingFamilyFilters = (
    c: DiscoveryItemsController,
    opts: TrendingFamilyFilterOpts = {},
): SelectFilter[] => {
    const q = c.query;
    const filters: SelectFilter[] = [
        {
            key: 'vertical',
            value: q.vertical,
            onChange: (v) => c.setQuery((s) => ({ ...s, vertical: v, videoType: undefined, page: 1 })),
            options: DISCOVERY_VERTICAL_OPTIONS,
            width: '130px',
        },
        {
            key: 'category',
            value: q.category ?? 'All',
            onChange: (v) => c.setQuery((s) => ({ ...s, category: v === 'All' ? undefined : v, page: 1 })),
            options: CREATOR_CATEGORY_OPTIONS,
            width: '160px',
        },
    ];

    if (opts.period) {
        filters.push({
            key: 'period',
            value: q.period,
            onChange: (v) => c.setQuery((s) => ({ ...s, period: v, page: 1 })),
            options: opts.period.options,
        });
    }

    if (q.vertical === 'video') {
        filters.push({
            key: 'videoType',
            value: q.videoType ?? 'All',
            onChange: (v) => c.setQuery((s) => ({ ...s, videoType: v === 'All' ? undefined : v, page: 1 })),
            options: VIDEO_TYPE_OPTIONS,
            width: '160px',
        });
    }

    return filters;
};
