import { isoDaysAgo, todayIso } from '../../lib/format';
import type { DateRangeQuery } from '../../types/monetization';

/** Date-range presets shared by the Revenue / Commission / Royalties summary pages. */
export const RANGE_OPTIONS = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'all', label: 'All time' },
];

/** Maps a preset token to a `{ from, to }` window (empty for "all time"). */
export const rangeFor = (preset: string): DateRangeQuery => {
    switch (preset) {
        case '7d':
            return { from: isoDaysAgo(7), to: todayIso() };
        case '90d':
            return { from: isoDaysAgo(90), to: todayIso() };
        case 'all':
            return {};
        case '30d':
        default:
            return { from: isoDaysAgo(30), to: todayIso() };
    }
};
