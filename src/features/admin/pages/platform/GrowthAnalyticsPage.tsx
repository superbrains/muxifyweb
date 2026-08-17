import React from 'react';
import { Grid, GridItem, HStack, SimpleGrid } from '@chakra-ui/react';
import { AdminPageLayout, AdminError, AdminLoading, KpiStrip } from '@shared/console';
import type { KpiItem } from '@shared/console';
import { Select } from '@shared/components';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { formatTrend } from '@/features/record-label/lib/format';
import { formatCount, isoDaysAgo, todayIso } from '@shared/console/lib/format';
import { exportCsv } from '@shared/console/lib/exportCsv';
import type { CsvColumn } from '@shared/console/lib/exportCsv';
import { ExportButton } from '../../components/finance/FinanceFilters';
import { QuickRanges } from '../../components/platform/QuickRanges';
import type { QuickRangeKey } from '../../components/platform/QuickRanges';
import { formatBucket, formatCompact } from '../../components/platform/chartFormat';
import { SignupsTrendChart } from '../../components/platform/growth/SignupsTrendChart';
import { RoleBreakdownDonut } from '../../components/platform/growth/RoleBreakdownDonut';
import { EngagementChart } from '../../components/platform/growth/EngagementChart';
import { RetentionHeatmap } from '../../components/platform/growth/RetentionHeatmap';
import { ActivationFunnel } from '../../components/platform/growth/ActivationFunnel';
import { PlatformSplitCard } from '../../components/platform/growth/PlatformSplitCard';
import { GrowthGeographyCard } from '../../components/platform/growth/GrowthGeographyCard';
import {
    useGrowthAnalytics,
    useGrowthEngagement,
    useGrowthFunnel,
    useGrowthRetention,
} from '../../hooks/usePlatform';
import type {
    DateWindow,
    Granularity,
    GrowthEngagementPoint,
    GrowthSignupPoint,
} from '../../types/platform';
import { DateWindowBar } from './DateWindowBar';

const GRANULARITY_OPTIONS = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
];

type CsvRow = GrowthSignupPoint & { engagement?: GrowthEngagementPoint };

const CSV_COLUMNS: CsvColumn<CsvRow>[] = [
    { header: 'Date', value: (r) => r.date },
    { header: 'New signups', value: (r) => r.signups },
    { header: 'Previous period signups', value: (r) => r.previousSignups ?? '' },
    { header: 'Cumulative users', value: (r) => r.cumulativeUsers },
    { header: 'Active users', value: (r) => r.engagement?.activeUsers ?? '' },
    { header: 'Rolling 7-day actives', value: (r) => r.engagement?.rollingWau ?? '' },
    { header: 'Rolling 30-day actives', value: (r) => r.engagement?.rollingMau ?? '' },
];

/** "12.3%" of a base, zero-guarded; em-dash while the source query loads. */
const pctOf = (numerator?: number, denominator?: number): string => {
    if (numerator === undefined || denominator === undefined) return '—';
    if (denominator === 0) return '0%';
    return `${((numerator / denominator) * 100).toFixed(1)}%`;
};

/**
 * Tower 22 — the growth command center: acquisition (signups vs previous
 * period, cumulative base, role/country mix), engagement (DAU/WAU/MAU,
 * stickiness, platform split), weekly retention cohorts, and the activation
 * funnel from signup to first purchase.
 */
const GrowthAnalyticsPage: React.FC = () => {
    const [range, setRange] = React.useState<DateWindow>({ from: isoDaysAgo(30), to: todayIso() });
    const [granularity, setGranularity] = React.useState<Granularity>('day');
    const [activePreset, setActivePreset] = React.useState<QuickRangeKey | undefined>('30d');

    const growth = useGrowthAnalytics({ ...range, granularity });
    const engagement = useGrowthEngagement({ ...range, granularity });
    const retention = useGrowthRetention(8);
    const funnel = useGrowthFunnel(range);

    const data = growth.data;
    const totals = data?.totals;
    const eng = engagement.data;
    const fun = funnel.data;

    const kpis: KpiItem[] = data
        ? [
              {
                  label: 'Total Users',
                  value: formatCount(totals?.totalUsers),
                  sub: 'All time',
              },
              {
                  label: 'New Signups',
                  value: formatCount(totals?.newSignups),
                  trend:
                      totals?.prevNewSignups === null || totals?.prevNewSignups === undefined
                          ? undefined
                          : formatTrend(totals.newSignups, totals.prevNewSignups),
                  trendCaption: 'vs prev period',
              },
              {
                  label: 'Signups / Day',
                  value: (totals?.signupsPerDay ?? 0).toLocaleString(undefined, {
                      maximumFractionDigits: 1,
                  }),
                  sub: totals?.peakDate
                      ? `Peak ${formatBucket(totals.peakDate, granularity)} · ${formatCount(totals.peakSignups)}`
                      : 'No peak yet',
              },
              {
                  label: 'DAU',
                  value: eng ? formatCompact(eng.currentDau) : '—',
                  sub: 'Active on the last day',
              },
              {
                  label: 'MAU',
                  value: eng ? formatCompact(eng.currentMau) : '—',
                  sub: '30-day actives',
              },
              {
                  label: 'Stickiness',
                  value: eng ? `${eng.stickinessPct.toFixed(1)}%` : '—',
                  sub: 'DAU / MAU',
              },
              {
                  label: 'Activation Rate',
                  value: pctOf(fun?.activated, fun?.signedUp),
                  sub: 'Signup → first play',
              },
              {
                  label: 'Paying Conversion',
                  value: pctOf(fun?.converted, fun?.signedUp),
                  sub: 'Signup → first purchase',
              },
          ]
        : [];

    const handleExport = () => {
        if (!data) return;
        const engagementByDate = new Map(
            (engagement.data?.series ?? []).map((p) => [p.date, p]),
        );
        const rows: CsvRow[] = data.series.map((p) => ({
            ...p,
            engagement: engagementByDate.get(p.date),
        }));
        exportCsv(
            `growth-analytics-${range.from ?? 'all'}-to-${range.to ?? 'now'}`,
            CSV_COLUMNS,
            rows,
        );
    };

    return (
        <AdminPageLayout
            title="Growth Analytics"
            subtitle="Acquisition, engagement, retention and activation across the platform"
            breadcrumbs={[{ label: 'Platform' }, { label: 'Growth Analytics' }]}
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

            {growth.isLoading && !data ? (
                <AdminLoading />
            ) : growth.error ? (
                <AdminError
                    error={growth.error}
                    message={getApiErrorMessage(growth.error, 'Could not load growth analytics.')}
                />
            ) : (
                <>
                    <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />

                    <Grid templateColumns={{ base: '1fr', xl: '1.7fr 1fr' }} gap={3}>
                        <GridItem minW={0}>
                            <SignupsTrendChart
                                series={data?.series ?? []}
                                granularity={granularity}
                                loading={growth.isLoading && !data}
                            />
                        </GridItem>
                        <GridItem minW={0}>
                            <RoleBreakdownDonut
                                byRole={data?.byRole ?? []}
                                loading={growth.isLoading && !data}
                            />
                        </GridItem>
                    </Grid>

                    <SimpleGrid columns={{ base: 1, xl: 2 }} gap={3}>
                        <EngagementChart
                            series={eng?.series ?? []}
                            granularity={granularity}
                            currentMau={eng?.currentMau ?? 0}
                            loading={engagement.isLoading && !eng}
                        />
                        <RetentionHeatmap
                            data={retention.data}
                            loading={retention.isLoading && !retention.data}
                        />
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, xl: 2 }} gap={3}>
                        <ActivationFunnel data={fun} loading={funnel.isLoading && !fun} />
                        <PlatformSplitCard
                            byPlatform={eng?.byPlatform ?? []}
                            loading={engagement.isLoading && !eng}
                        />
                    </SimpleGrid>

                    <GrowthGeographyCard
                        byCountry={data?.byCountry ?? []}
                        loading={growth.isLoading && !data}
                    />
                </>
            )}
        </AdminPageLayout>
    );
};

export default GrowthAnalyticsPage;
