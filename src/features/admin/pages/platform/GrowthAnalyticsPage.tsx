import React from 'react';
import { Box, Center, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { FiUsers } from 'react-icons/fi';
import { baseChartTheme } from '@/features/record-label/lib/chartTheme';
import {
    AdminPageLayout,
    AdminError,
    DataTable,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { Select } from '@shared/components';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { formatCount, isoDaysAgo, todayIso } from '../../lib/format';
import { useGrowthAnalytics } from '../../hooks/usePlatform';
import type { DateWindow, Granularity, GrowthRoleBreakdown } from '../../types/platform';
import { DateWindowBar } from './DateWindowBar';

const formatBucket = (iso: string): string => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const GRANULARITY_OPTIONS = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
];

const ROLE_COLUMNS: DataColumn<GrowthRoleBreakdown>[] = [
    { key: 'role', header: 'Role', render: (r) => <Text fontWeight="medium" textTransform="capitalize">{r.role.replace(/_/g, ' ')}</Text> },
    { key: 'count', header: 'Signups', align: 'right', render: (r) => formatCount(r.count) },
];

/** Tower 22 — signups time-series + signups-by-role breakdown over a window. */
const GrowthAnalyticsPage: React.FC = () => {
    const [range, setRange] = React.useState<DateWindow & { granularity: Granularity }>({
        from: isoDaysAgo(30),
        to: todayIso(),
        granularity: 'day',
    });
    const { data, isLoading, error } = useGrowthAnalytics(range);

    const series = data?.series ?? [];
    const total = series.reduce((sum, p) => sum + p.signups, 0);
    const trendPct = data?.trendPct ?? 0;

    const options: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'area' },
        stroke: { curve: 'smooth', width: 2.5 },
        colors: ['#f94444'],
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] },
        },
        xaxis: {
            ...baseChartTheme.xaxis,
            categories: series.map((p) => formatBucket(p.date)),
            tickAmount: 6,
        },
        markers: { size: 0, hover: { size: 5 } },
    };

    return (
        <AdminPageLayout
            title="Growth Analytics"
            subtitle="New signups over time and how they break down by role"
            breadcrumbs={[{ label: 'Platform' }, { label: 'Growth Analytics' }]}
        >
            <DateWindowBar
                range={range}
                onChange={(next) => setRange((r) => ({ ...r, ...next }))}
                right={
                    <Box ml={{ lg: 'auto' }}>
                        <Select
                            options={GRANULARITY_OPTIONS}
                            value={range.granularity}
                            onChange={(v) => setRange((r) => ({ ...r, granularity: v as Granularity }))}
                            width="130px"
                            borderColor="gray.200"
                            borderRadius="10px"
                        />
                    </Box>
                }
            />

            {error ? (
                <AdminError error={error} message={getApiErrorMessage(error, 'Could not load growth analytics.')} />
            ) : (
                <>
                    <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100">
                        <HStack justify="space-between" align="flex-start" mb={3}>
                            <VStack align="start" gap={0.5}>
                                <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                                    New signups
                                </Text>
                                <Text fontSize="9px" color="gray.500">
                                    {trendPct >= 0 ? '+' : ''}{trendPct.toFixed(1)}% vs previous period
                                </Text>
                            </VStack>
                            <VStack align="end" gap={0}>
                                <Text fontSize="md" fontWeight="bold" color="gray.900">
                                    {total.toLocaleString()}
                                </Text>
                                <Text fontSize="9px" color="gray.500">
                                    Total
                                </Text>
                            </VStack>
                        </HStack>

                        {isLoading && !data ? (
                            <Center h="260px">
                                <Spinner size="sm" color="primary.500" />
                            </Center>
                        ) : total === 0 ? (
                            <Center h="260px">
                                <Text fontSize="xs" color="gray.500">
                                    No signups in this window yet.
                                </Text>
                            </Center>
                        ) : (
                            <ReactApexChart
                                options={options}
                                series={[{ name: 'Signups', data: series.map((p) => p.signups) }]}
                                height={260}
                                type="area"
                            />
                        )}
                    </Box>

                    <DataTable
                        columns={ROLE_COLUMNS}
                        rows={data?.byRole ?? []}
                        rowKey={(r) => r.role}
                        loading={isLoading && !data}
                        emptyIcon={FiUsers}
                        emptyTitle="No signups by role"
                        emptyDescription="Nothing was recorded in this window."
                    />
                </>
            )}
        </AdminPageLayout>
    );
};

export default GrowthAnalyticsPage;
