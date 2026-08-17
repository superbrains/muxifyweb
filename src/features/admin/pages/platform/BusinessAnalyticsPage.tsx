import React from 'react';
import { Box, Grid, GridItem, HStack, SimpleGrid, VStack } from '@chakra-ui/react';
import { AdminPageLayout, AdminError, AdminLoading, KpiStrip } from '@shared/console';
import type { KpiItem } from '@shared/console';
import { Select } from '@shared/components';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { formatTrend } from '@/features/record-label/lib/format';
import { formatCount, formatMinorAmount, isoDaysAgo, todayIso } from '@shared/console/lib/format';
import { exportCsv } from '@shared/console/lib/exportCsv';
import type { CsvColumn } from '@shared/console/lib/exportCsv';
import { ExportButton } from '../../components/finance/FinanceFilters';
import { ChartCard } from '../../components/platform/ChartCard';
import { QuickRanges } from '../../components/platform/QuickRanges';
import type { QuickRangeKey } from '../../components/platform/QuickRanges';
import { RevenueTrendChart } from '../../components/platform/RevenueTrendChart';
import { RevenueMixDonut } from '../../components/platform/RevenueMixDonut';
import { EconomyStatsCard } from '../../components/platform/EconomyStatsCard';
import { CoinEconomyChart } from '../../components/platform/CoinEconomyChart';
import { UserEconomicsChart } from '../../components/platform/UserEconomicsChart';
import { TopPerformers } from '../../components/platform/TopPerformers';
import { GeographyCard } from '../../components/platform/GeographyCard';
import {
    useBusinessAnalytics,
    useBusinessTimeseries,
    useBusinessTop,
} from '../../hooks/usePlatform';
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
        row('Total revenue (minor)', data.totalRevenueMinor, prev?.totalRevenueMinor),
        row('Platform fees (minor)', data.platformFeesMinor, prev?.platformFeesMinor),
        row('Net revenue (minor)', data.netRevenueMinor, prev?.netRevenueMinor),
        row('Payouts (minor)', data.payoutsMinor, prev?.payoutsMinor),
        row('Gross coin volume', data.grossCoinVolume, prev?.grossCoinVolume),
        row('Coins purchased', data.coinsPurchased, prev?.coinsPurchased),
        row('Coins spent', data.coinsSpent, prev?.coinsSpent),
        row('Paying users', data.payingUsers, prev?.payingUsers),
        row('New signups', data.newSignups, prev?.newSignups),
        row('Coin purchases', data.purchasesCount, prev?.purchasesCount),
        row('ARPPU (minor)', data.arppuMinor, prev?.arppuMinor),
        row('ARPU (minor)', data.arpuMinor),
        row('Paying conversion (%)', data.conversionPct),
        row('Platform take rate (%)', data.feeRatePct),
        row('Total users', data.totalUsers),
    ];
};

const CSV_COLUMNS: CsvColumn<ReturnType<typeof buildCsvRows>[number]>[] = [
    { header: 'Metric', value: (r) => r.metric },
    { header: 'Current window', value: (r) => r.current },
    { header: 'Previous window', value: (r) => r.previous },
    { header: 'Change %', value: (r) => r.changePct },
];

/**
 * Tower 1 — the executive business-analysis dashboard: KPIs with
 * period-over-period deltas, revenue/fee/payout trends, revenue mix, coin
 * economy flow, user economics, leaderboards and artist-side geography.
 */
const BusinessAnalyticsPage: React.FC = () => {
    const [range, setRange] = React.useState<DateWindow>({ from: isoDaysAgo(30), to: todayIso() });
    const [granularity, setGranularity] = React.useState<Granularity>('day');
    const [activePreset, setActivePreset] = React.useState<QuickRangeKey | undefined>('30d');

    const business = useBusinessAnalytics(range);
    const timeseries = useBusinessTimeseries({ ...range, granularity });
    const top = useBusinessTop({ ...range, limit: 5 });

    const data = business.data;
    const currency = data?.currency ?? 'NGN';
    const prev = data?.previous ?? undefined;
    const series = timeseries.data?.series ?? [];

    /** KPI with a period-over-period chip only when a previous window exists. */
    const kpi = (label: string, value: string, current: number, previous?: number): KpiItem => ({
        label,
        value,
        trend: previous === undefined ? undefined : formatTrend(current, previous),
        trendCaption: previous === undefined ? undefined : 'vs prev period',
    });

    const kpis: KpiItem[] = data
        ? [
              kpi(
                  'Total Revenue',
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
              ),
              kpi(
                  'Payouts',
                  formatMinorAmount(data.payoutsMinor, currency),
                  data.payoutsMinor,
                  prev?.payoutsMinor,
              ),
              kpi(
                  'Paying Users',
                  formatCount(data.payingUsers),
                  data.payingUsers,
                  prev?.payingUsers,
              ),
              kpi('New Signups', formatCount(data.newSignups), data.newSignups, prev?.newSignups),
              kpi(
                  'ARPPU',
                  formatMinorAmount(data.arppuMinor, currency),
                  data.arppuMinor,
                  prev?.arppuMinor,
              ),
              {
                  label: 'Paying Conversion',
                  value: `${data.conversionPct.toFixed(1)}%`,
                  sub: `${formatCount(data.payingUsers)} of ${formatCount(data.totalUsers)} users`,
              },
          ]
        : [];

    const handleExport = () => {
        if (!data) return;
        exportCsv(
            `business-analytics-${range.from ?? 'all'}-to-${range.to ?? 'now'}`,
            CSV_COLUMNS,
            buildCsvRows(data),
        );
    };

    return (
        <AdminPageLayout
            title="Business Analytics"
            subtitle="Revenue, coin economy and user economics across the platform"
            breadcrumbs={[{ label: 'Platform' }, { label: 'Business Analytics' }]}
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
                    message={getApiErrorMessage(business.error, 'Could not load business analytics.')}
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
                            <VStack align="stretch" gap={3}>
                                <RevenueMixDonut
                                    mix={data?.revenueMix ?? []}
                                    currency={currency}
                                    loading={business.isLoading && !data}
                                />
                                {data ? (
                                    <EconomyStatsCard data={data} loading={false} />
                                ) : (
                                    <ChartCard title="Unit economics" loading minH="180px">
                                        <Box />
                                    </ChartCard>
                                )}
                            </VStack>
                        </GridItem>
                    </Grid>

                    <SimpleGrid columns={{ base: 1, xl: 2 }} gap={3}>
                        <CoinEconomyChart
                            series={series}
                            granularity={granularity}
                            loading={timeseries.isLoading && !timeseries.data}
                        />
                        <UserEconomicsChart
                            series={series}
                            granularity={granularity}
                            loading={timeseries.isLoading && !timeseries.data}
                        />
                    </SimpleGrid>

                    <TopPerformers
                        data={top.data}
                        currency={currency}
                        loading={top.isLoading && !top.data}
                    />

                    <GeographyCard range={range} currency={currency} />
                </>
            )}
        </AdminPageLayout>
    );
};

export default BusinessAnalyticsPage;
