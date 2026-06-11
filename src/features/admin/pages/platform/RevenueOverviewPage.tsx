import React from 'react';
import { Grid, GridItem, HStack, SimpleGrid } from '@chakra-ui/react';
import { AdminPageLayout, AdminError, AdminLoading, KpiStrip } from '../../components/ui';
import type { KpiItem } from '../../components/ui';
import { Select } from '@shared/components';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { formatTrend } from '@/features/record-label/lib/format';
import { formatCount, formatMinorAmount, isoDaysAgo, todayIso } from '../../lib/format';
import { exportCsv } from '../../lib/exportCsv';
import type { CsvColumn } from '../../lib/exportCsv';
import { ExportButton } from '../../components/finance/FinanceFilters';
import { QuickRanges } from '../../components/platform/QuickRanges';
import type { QuickRangeKey } from '../../components/platform/QuickRanges';
import { RevenueTrendChart } from '../../components/platform/RevenueTrendChart';
import { RevenueMixDonut } from '../../components/platform/RevenueMixDonut';
import { TopPerformers } from '../../components/platform/TopPerformers';
import { GeographyCard } from '../../components/platform/GeographyCard';
import { NetRevenueWaterfall } from '../../components/platform/revenue/NetRevenueWaterfall';
import { RevenueBySourceCard } from '../../components/platform/revenue/RevenueBySourceCard';
import { CommissionByTypeCard } from '../../components/platform/revenue/CommissionByTypeCard';
import { RoyaltiesByRoleCard } from '../../components/platform/revenue/RoyaltiesByRoleCard';
import { TreasuryCard } from '../../components/platform/revenue/TreasuryCard';
import {
    useBusinessAnalytics,
    useBusinessTimeseries,
    useBusinessTop,
} from '../../hooks/usePlatform';
import { useCommission, useRevenue, useRoyalties } from '../../hooks/useMonetization';
import { useFinanceOverview } from '../../hooks/useFinance';
import type { BusinessAnalytics, DateWindow, Granularity } from '../../types/platform';
import { DateWindowBar } from './DateWindowBar';

const GRANULARITY_OPTIONS = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
];

/** Metric rows for the CSV export — current window vs the previous one. */
const buildCsvRows = (data: BusinessAnalytics) => {
    const prev = data.previous;
    const row = (metric: string, current: number, previous?: number) => ({
        metric,
        current,
        previous: previous ?? '',
        changePct:
            previous === undefined || previous === 0
                ? ''
                : (((current - previous) / previous) * 100).toFixed(1),
    });
    return [
        row('Gross revenue (minor)', data.totalRevenueMinor, prev?.totalRevenueMinor),
        row('Platform fees (minor)', data.platformFeesMinor, prev?.platformFeesMinor),
        row('Net revenue (minor)', data.netRevenueMinor, prev?.netRevenueMinor),
        row('Creator payouts (minor)', data.payoutsMinor, prev?.payoutsMinor),
        row('ARPU (minor)', data.arpuMinor),
        row('ARPPU (minor)', data.arppuMinor, prev?.arppuMinor),
        row('Coins sold', data.coinsPurchased, prev?.coinsPurchased),
        row('Coin purchases', data.purchasesCount, prev?.purchasesCount),
        row('Platform take rate (%)', data.feeRatePct),
        row('Paying conversion (%)', data.conversionPct),
    ];
};

const CSV_COLUMNS: CsvColumn<ReturnType<typeof buildCsvRows>[number]>[] = [
    { header: 'Metric', value: (r) => r.metric },
    { header: 'Current window', value: (r) => r.current },
    { header: 'Previous window', value: (r) => r.previous },
    { header: 'Change %', value: (r) => r.changePct },
];

/**
 * Tower 24 — the platform revenue command center. Headline P&L KPIs with
 * period-over-period deltas, a revenue/fees/payouts trend, the earnings mix and
 * a gross→net bridge, funding by provider, platform commission and creator
 * royalty splits, the treasury/liability position, revenue geography and the
 * top revenue drivers. Composes existing analytics hooks — no new API surface.
 */
const RevenueOverviewPage: React.FC = () => {
    const [range, setRange] = React.useState<DateWindow>({ from: isoDaysAgo(30), to: todayIso() });
    const [granularity, setGranularity] = React.useState<Granularity>('day');
    const [activePreset, setActivePreset] = React.useState<QuickRangeKey | undefined>('30d');

    const business = useBusinessAnalytics(range);
    const timeseries = useBusinessTimeseries({ ...range, granularity });
    const top = useBusinessTop({ ...range, limit: 5 });
    const revenue = useRevenue(range);
    const commission = useCommission(range);
    const royalties = useRoyalties(range);
    const finance = useFinanceOverview(range);

    const data = business.data;
    const currency = data?.currency ?? 'NGN';
    const prev = data?.previous ?? undefined;
    const series = timeseries.data?.series ?? [];

    /** KPI with a period-over-period chip only when a previous window exists. */
    const kpi = (
        label: string,
        value: string,
        current: number,
        previous?: number,
        sub?: string,
    ): KpiItem => ({
        label,
        value,
        sub,
        trend: previous === undefined ? undefined : formatTrend(current, previous),
        trendCaption: previous === undefined ? undefined : 'vs prev period',
    });

    const kpis: KpiItem[] = data
        ? [
              kpi(
                  'Gross Revenue',
                  formatMinorAmount(data.totalRevenueMinor, currency),
                  data.totalRevenueMinor,
                  prev?.totalRevenueMinor,
              ),
              kpi(
                  'Net Revenue',
                  formatMinorAmount(data.netRevenueMinor, currency),
                  data.netRevenueMinor,
                  prev?.netRevenueMinor,
              ),
              kpi(
                  'Platform Fees',
                  formatMinorAmount(data.platformFeesMinor, currency),
                  data.platformFeesMinor,
                  prev?.platformFeesMinor,
                  `${data.feeRatePct.toFixed(1)}% take rate`,
              ),
              kpi(
                  'Creator Payouts',
                  formatMinorAmount(data.payoutsMinor, currency),
                  data.payoutsMinor,
                  prev?.payoutsMinor,
              ),
              {
                  label: 'ARPU',
                  value: formatMinorAmount(data.arpuMinor, currency),
                  sub: 'Per user',
              },
              kpi(
                  'ARPPU',
                  formatMinorAmount(data.arppuMinor, currency),
                  data.arppuMinor,
                  prev?.arppuMinor,
                  'Per paying user',
              ),
              kpi(
                  'Coins Sold',
                  formatCount(data.coinsPurchased),
                  data.coinsPurchased,
                  prev?.coinsPurchased,
              ),
              kpi(
                  'Purchases',
                  formatCount(data.purchasesCount),
                  data.purchasesCount,
                  prev?.purchasesCount,
              ),
          ]
        : [];

    const handleExport = () => {
        if (!data) return;
        exportCsv(
            `revenue-overview-${range.from ?? 'all'}-to-${range.to ?? 'now'}`,
            CSV_COLUMNS,
            buildCsvRows(data),
        );
    };

    return (
        <AdminPageLayout
            title="Revenue Overview"
            subtitle="Platform P&L, monetization mix, payouts and treasury at a glance"
            breadcrumbs={[{ label: 'Platform' }, { label: 'Revenue' }]}
            actions={<ExportButton onClick={handleExport} disabled={!data} />}
        >
            <DateWindowBar
                range={range}
                onChange={(next) => {
                    setRange(next);
                    setActivePreset(undefined);
                }}
                right={
                    <HStack gap={2} ml={{ lg: 'auto' }} flexWrap="wrap">
                        <QuickRanges
                            active={activePreset}
                            onSelect={(key, next) => {
                                setActivePreset(key);
                                setRange(next);
                            }}
                        />
                        <Select
                            options={GRANULARITY_OPTIONS}
                            value={granularity}
                            onChange={(v) => setGranularity(v as Granularity)}
                            width="120px"
                            borderColor="gray.200"
                            borderRadius="10px"
                        />
                    </HStack>
                }
            />

            {business.isLoading && !data ? (
                <AdminLoading />
            ) : business.error ? (
                <AdminError
                    error={business.error}
                    message={getApiErrorMessage(business.error, 'Could not load revenue overview.')}
                />
            ) : (
                <>
                    <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />

                    <Grid templateColumns={{ base: '1fr', xl: '1.7fr 1fr' }} gap={3}>
                        <GridItem minW={0}>
                            <RevenueTrendChart
                                series={series}
                                granularity={granularity}
                                currency={currency}
                                loading={timeseries.isLoading && !timeseries.data}
                            />
                        </GridItem>
                        <GridItem minW={0}>
                            <RevenueMixDonut
                                mix={data?.revenueMix ?? []}
                                currency={currency}
                                loading={business.isLoading && !data}
                            />
                        </GridItem>
                    </Grid>

                    <SimpleGrid columns={{ base: 1, xl: 2 }} gap={3}>
                        <NetRevenueWaterfall
                            grossMinor={data?.totalRevenueMinor ?? 0}
                            feesMinor={data?.platformFeesMinor ?? 0}
                            payoutsMinor={data?.payoutsMinor ?? 0}
                            currency={currency}
                            loading={business.isLoading && !data}
                        />
                        <RevenueBySourceCard
                            bySource={revenue.data?.bySource ?? []}
                            currency={revenue.data?.currency ?? currency}
                            loading={revenue.isLoading && !revenue.data}
                        />
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, xl: 2 }} gap={3} alignItems="start">
                        <CommissionByTypeCard
                            data={commission.data}
                            loading={commission.isLoading && !commission.data}
                        />
                        <RoyaltiesByRoleCard
                            data={royalties.data}
                            loading={royalties.isLoading && !royalties.data}
                        />
                    </SimpleGrid>

                    <TreasuryCard data={finance.data} loading={finance.isLoading && !finance.data} />

                    <GeographyCard range={range} currency={currency} />

                    <TopPerformers
                        data={top.data}
                        currency={currency}
                        loading={top.isLoading && !top.data}
                    />
                </>
            )}
        </AdminPageLayout>
    );
};

export default RevenueOverviewPage;
