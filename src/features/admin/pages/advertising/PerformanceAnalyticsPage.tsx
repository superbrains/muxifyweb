import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { FiBarChart2 } from 'react-icons/fi';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    DataTable,
    FilterBar,
    KpiStrip,
} from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { adminDate, formatCount, formatMinorAmount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useAdAnalytics } from '../../hooks/useAdvertising';
import type {
    AdDailyMetricDto,
    AdTopCampaignDto,
    AnalyticsQuery,
} from '../../types/advertising';
import { RANGE_OPTIONS, rangeFor } from '../monetization/rangeFilter';
import { NoAccess } from './NoAccess';

/** Performance analytics — engagement totals plus the top campaigns by performance. */
const PerformanceAnalyticsPage: React.FC = () => {
    const canView = useHasPermission('AdvertisingView');
    const [preset, setPreset] = React.useState('30d');
    const query: AnalyticsQuery = React.useMemo(() => rangeFor(preset), [preset]);
    const { data, isLoading, error } = useAdAnalytics(query);

    const currency = data?.currency ?? 'NGN';

    const kpis: KpiItem[] = [
        { label: 'Impressions', value: formatCount(data?.totalImpressions) },
        { label: 'Clicks', value: formatCount(data?.totalClicks) },
        { label: 'Avg CTR', value: `${(data?.avgCtr ?? 0).toFixed(2)}%` },
        { label: 'Total spend', value: formatMinorAmount(data?.totalSpendMinor, currency) },
    ];

    const columns: DataColumn<AdTopCampaignDto>[] = [
        {
            key: 'name',
            header: 'Campaign',
            render: (c) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineClamp={1}>
                    {c.name}
                </Text>
            ),
        },
        {
            key: 'impressions',
            header: 'Impressions',
            align: 'right',
            render: (c) => (
                <Text fontSize="xs" color="gray.700">
                    {formatCount(c.impressions)}
                </Text>
            ),
        },
        {
            key: 'clicks',
            header: 'Clicks',
            align: 'right',
            render: (c) => (
                <Text fontSize="xs" color="gray.700">
                    {formatCount(c.clicks)}
                </Text>
            ),
        },
        {
            key: 'ctr',
            header: 'CTR',
            align: 'right',
            render: (c) => (
                <Text fontSize="xs" color="gray.700">
                    {c.clickThroughRate.toFixed(2)}%
                </Text>
            ),
        },
        {
            key: 'cpc',
            header: 'CPC',
            align: 'right',
            render: (c) => (
                <Text fontSize="xs" color="gray.700">
                    {formatMinorAmount(c.costPerClickMinor, currency)}
                </Text>
            ),
        },
        {
            key: 'spend',
            header: 'Spend',
            align: 'right',
            render: (c) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {formatMinorAmount(c.amountSpentMinor, currency)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Performance Analytics"
            subtitle="Advertising engagement and spend, with the best-performing campaigns."
            breadcrumbs={[{ label: 'Advertising' }, { label: 'Analytics' }]}
        >
            {!canView ? (
                <NoAccess />
            ) : (
                <>
                    <FilterBar
                        filters={[
                            {
                                key: 'range',
                                value: preset,
                                onChange: setPreset,
                                options: RANGE_OPTIONS,
                                width: '170px',
                            },
                        ]}
                    />

                    {error ? (
                        <AdminError error={error} message="Could not load analytics." />
                    ) : isLoading && !data ? (
                        <AdminLoading />
                    ) : (
                        <>
                            <KpiStrip items={kpis} columns={{ base: 2, md: 4, xl: 4 }} />
                            <DailyMetricsChart
                                metrics={data?.dailyMetrics ?? []}
                                currency={currency}
                            />
                            <DataTable
                                columns={columns}
                                rows={data?.topCampaigns ?? []}
                                rowKey={(c) => c.campaignId}
                                emptyIcon={FiBarChart2}
                                emptyTitle="No performance data"
                                emptyDescription="No campaign activity in the selected window."
                            />
                        </>
                    )}
                </>
            )}
        </AdminPageLayout>
    );
};

export default PerformanceAnalyticsPage;

/* ------------------------------ Per-day chart ----------------------------- */

type DailySeries = 'impressions' | 'clicks' | 'spend';

const SERIES_META: Record<DailySeries, { label: string; color: string }> = {
    impressions: { label: 'Impressions', color: '#3B82F6' },
    clicks: { label: 'Clicks', color: '#16A34A' },
    spend: { label: 'Spend', color: '#FF2D55' },
};

/**
 * Dependency-free per-day chart. The repo ships no charting library, so this
 * renders normalised-height div bars (one per day) with a hover `title` tooltip
 * — switchable between impressions, clicks and spend.
 */
const DailyMetricsChart: React.FC<{ metrics: AdDailyMetricDto[]; currency: string }> = ({
    metrics,
    currency,
}) => {
    const [series, setSeries] = React.useState<DailySeries>('impressions');

    const valueOf = (m: AdDailyMetricDto): number =>
        series === 'impressions' ? m.impressions : series === 'clicks' ? m.clicks : m.spendMinor;

    const display = (m: AdDailyMetricDto): string =>
        series === 'spend'
            ? formatMinorAmount(m.spendMinor, currency)
            : formatCount(valueOf(m));

    const max = metrics.reduce((acc, m) => Math.max(acc, valueOf(m)), 0);

    return (
        <Box
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            px={{ base: 3, md: 4 }}
            py={4}
        >
            <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    Daily performance
                </Text>
                <HStack gap={1}>
                    {(Object.keys(SERIES_META) as DailySeries[]).map((s) => {
                        const active = s === series;
                        return (
                            <Box
                                as="button"
                                key={s}
                                onClick={() => setSeries(s)}
                                fontSize="11px"
                                fontWeight="semibold"
                                px={2.5}
                                py={1}
                                borderRadius="8px"
                                bg={active ? SERIES_META[s].color : 'gray.50'}
                                color={active ? 'white' : 'gray.600'}
                                border="1px solid"
                                borderColor={active ? SERIES_META[s].color : 'gray.200'}
                            >
                                {SERIES_META[s].label}
                            </Box>
                        );
                    })}
                </HStack>
            </HStack>

            {metrics.length === 0 ? (
                <Text fontSize="xs" color="gray.400" py={6} textAlign="center">
                    No daily activity in the selected window.
                </Text>
            ) : (
                <HStack align="flex-end" gap={1} h="140px" overflowX="auto">
                    {metrics.map((m) => {
                        const v = valueOf(m);
                        const pct = max > 0 ? Math.max(2, Math.round((v / max) * 100)) : 2;
                        return (
                            <VStack
                                key={m.date}
                                gap={0}
                                flex="1"
                                minW="6px"
                                h="100%"
                                justify="flex-end"
                                title={`${adminDate(m.date)} · ${display(m)}`}
                            >
                                <Box
                                    w="100%"
                                    h={`${pct}%`}
                                    bg={SERIES_META[series].color}
                                    borderTopRadius="3px"
                                    transition="height 0.2s"
                                    _hover={{ opacity: 0.8 }}
                                />
                            </VStack>
                        );
                    })}
                </HStack>
            )}
        </Box>
    );
};
