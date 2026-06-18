/**
 * Builds a single multi-section CSV for the artist Sales Report and triggers a
 * browser download. The report is several logical tables (revenue per day,
 * summary, top earnings, giftings, unlock stats), so unlike the generic
 * `exportCsv` (one column-map, one table) this composes them into one file with
 * labelled sections. Cells are quoted/escaped the same way so commas, quotes
 * and newlines in the data don't corrupt the output.
 */
import type {
    DashboardAnalyticsDto,
    TopTracksDto,
    UnlockStatsDto,
} from '@/features/dashboard/services/dashboardService';
import { getAnalyticsCategories } from '@/features/dashboard/utils/chartMappers';
import type { GiftBreakdownItem } from '../hooks/useSalesReport';

const escapeCell = (raw: string | number | null | undefined): string => {
    const s = raw === null || raw === undefined ? '' : String(raw);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const row = (cells: Array<string | number | null | undefined>): string =>
    cells.map(escapeCell).join(',');

export interface SalesReportCsvInput {
    analytics: DashboardAnalyticsDto | null;
    topTracks: TopTracksDto | null;
    unlockStats: UnlockStatsDto | null;
    giftBreakdown: GiftBreakdownItem[];
    giftCount: number;
    totalGiftValue: number;
    /** Human label for the active range (e.g. "Daily" or "1 Jun - 18 Jun"). */
    periodLabel: string;
}

export function buildSalesReportCsv(input: SalesReportCsvInput): string {
    const { analytics, topTracks, unlockStats, giftBreakdown, giftCount, totalGiftValue, periodLabel } = input;
    const lines: string[] = [];

    lines.push(row(['Sales Report', periodLabel]));
    lines.push('');

    // --- Revenue per day (Gifting / Unlocked / Commission) ---
    lines.push(row(['Revenue (per day)']));
    lines.push(row(['Date', 'Gifting', 'Unlocked', 'Commission']));
    if (analytics) {
        const categories = getAnalyticsCategories(analytics, []);
        const gifting = analytics.giftEarningsChart.data;
        const unlocked = analytics.unlockEarningsChart.data;
        const commission = analytics.otherEarningsChart.data;
        categories.forEach((label, i) => {
            lines.push(row([label, gifting[i]?.value ?? 0, unlocked[i]?.value ?? 0, commission[i]?.value ?? 0]));
        });
    }
    lines.push('');

    // --- Summary totals ---
    lines.push(row(['Summary']));
    lines.push(row(['Metric', 'Value']));
    if (analytics) {
        lines.push(row(['Profit (after commission, N)', analytics.totalEarningsDisplay]));
        lines.push(row(['Total Muxify coins earned', analytics.totalCoinsEarned]));
        lines.push(row(['Total content unlocks', analytics.totalContentUnlocks]));
        lines.push(row(['  Music unlocks', analytics.musicUnlocks]));
        lines.push(row(['  Video unlocks', analytics.videoUnlocks]));
        lines.push(row(['Unlock earnings (N)', analytics.totalUnlockEarningsDisplay]));
        lines.push(row(['Unlock coins', analytics.totalUnlockCoins]));
        lines.push(row(['Total gifts received', analytics.totalGiftsReceived]));
        lines.push(row(['Total plays', analytics.totalPlays]));
    }
    lines.push('');

    // --- Top earnings ---
    lines.push(row(['Top Earnings']));
    lines.push(row(['#', 'Name', 'Plays', 'Sales (N)']));
    (topTracks?.tracks ?? []).forEach((t, i) => {
        lines.push(row([String(i + 1).padStart(2, '0'), t.title, t.playCount, t.earningsDisplay]));
    });
    lines.push('');

    // --- Giftings breakdown ---
    lines.push(row(['Giftings', `${giftCount} gifts`, `N${totalGiftValue}`]));
    lines.push(row(['Gift type', 'Count', 'Value (N)']));
    giftBreakdown.forEach((g) => {
        lines.push(row([g.type, g.count, g.totalValue]));
    });
    lines.push('');

    // --- Unlock stats (today vs yesterday) ---
    lines.push(row(['Unlock Stats']));
    lines.push(row(['Day', 'Count', 'Earnings (N)', 'Coins']));
    if (unlockStats) {
        lines.push(row(['Yesterday', unlockStats.yesterday.count, unlockStats.yesterday.earningsDisplay, unlockStats.yesterday.muxifyCoins]));
        lines.push(row(['Today', unlockStats.today.count, unlockStats.today.earningsDisplay, unlockStats.today.muxifyCoins]));
    }

    return lines.join('\n');
}

export function exportSalesReportCsv(filename: string, input: SalesReportCsvInput): void {
    const csv = buildSalesReportCsv(input);
    // Prepend a BOM so Excel reads UTF-8 correctly.
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
