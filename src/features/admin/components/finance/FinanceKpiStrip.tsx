import { SimpleGrid } from '@chakra-ui/react';
import { KpiCard } from '@/features/record-label/components/KpiCard';
import { formatCount, formatMinorAmount } from '../../lib/format';
import type { FinanceOverview } from '../../types/finance';

export function FinanceKpiStrip({ overview }: { overview: FinanceOverview }) {
    const cur = overview.currency || 'NGN';
    const trend =
        overview.fundingTrendPct === null || overview.fundingTrendPct === undefined
            ? undefined
            : { deltaPct: Math.abs(overview.fundingTrendPct), isPositive: overview.fundingTrendPct >= 0 };

    return (
        <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} gap={3}>
            <KpiCard
                bg="#E7FFF7"
                iconColor="#16A34A"
                label="Gross Funding"
                value={formatMinorAmount(overview.grossFundingMinor, cur)}
                trend={trend}
                trendCaption="vs prev period"
            />
            <KpiCard
                bg="#F6F1FF"
                iconColor="#7C3AED"
                label="Fees Collected"
                value={formatMinorAmount(overview.feesCollectedMinor, cur)}
            />
            <KpiCard
                bg="#FFF5F6"
                iconColor="#f94444"
                label="Coin Volume"
                value={`${formatCount(overview.grossCoinVolume)} coins`}
            />
            <KpiCard
                bg="#ECF7FF"
                iconColor="#3B82F6"
                label="Coins in Circulation"
                value={`${formatCount(overview.coinsInCirculation)} coins`}
            />
            <KpiCard
                bg="#FFF9E6"
                iconColor="#D97706"
                label="Pending Payouts"
                value={formatMinorAmount(overview.pendingPayoutsMinor, cur)}
                sub={`${formatCount(overview.pendingPayoutsCount)} payouts · ${formatCount(
                    overview.failedPayoutsCount,
                )} failed`}
            />
            <KpiCard
                bg="#FEF2F2"
                iconColor="#E53E3E"
                label="Unwithdrawn Earnings"
                value={formatMinorAmount(overview.unwithdrawnEarningsMinor, cur)}
                sub={`${formatCount(overview.pendingWithdrawalsCount)} withdrawals pending`}
            />
        </SimpleGrid>
    );
}
