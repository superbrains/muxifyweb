import React from 'react';
import { Box, Center, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { FiDollarSign } from 'react-icons/fi';
import { baseChartTheme } from '@/features/record-label/lib/chartTheme';
import {
    AdminPageLayout,
    AdminError,
    DataTable,
    KpiStrip,
} from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { formatMinorAmount, isoDaysAgo, todayIso } from '../../lib/format';
import { useRevenueOverview } from '../../hooks/usePlatform';
import type { DateWindow, RevenueTypeBreakdown } from '../../types/platform';
import { DateWindowBar } from './DateWindowBar';

const formatBucket = (iso: string): string => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/** Tower 24 — funding/fees/payouts/net KPIs, a revenue time-series and a by-type table. */
const RevenueOverviewPage: React.FC = () => {
    const [range, setRange] = React.useState<DateWindow>({ from: isoDaysAgo(30), to: todayIso() });
    const { data, isLoading, error } = useRevenueOverview(range);

    const currency = data?.currency ?? 'NGN';

    const items: KpiItem[] = data
        ? [
              { label: 'Gross Funding', value: formatMinorAmount(data.grossFundingMinor, currency) },
              { label: 'Fees', value: formatMinorAmount(data.feesMinor, currency) },
              { label: 'Payouts', value: formatMinorAmount(data.payoutsMinor, currency) },
              { label: 'Net', value: formatMinorAmount(data.netMinor, currency) },
          ]
        : [];

    const typeColumns: DataColumn<RevenueTypeBreakdown>[] = [
        { key: 'type', header: 'Type', render: (r) => <Text fontWeight="medium" textTransform="capitalize">{r.type.replace(/_/g, ' ')}</Text> },
        { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatMinorAmount(r.amountMinor, currency) },
    ];

    const series = data?.series ?? [];
    const options: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'area' },
        stroke: { curve: 'smooth', width: 2.5 },
        colors: ['#16A34A'],
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.04, stops: [0, 100] },
        },
        xaxis: {
            ...baseChartTheme.xaxis,
            categories: series.map((p) => formatBucket(p.date)),
            tickAmount: 6,
        },
        yaxis: {
            ...baseChartTheme.yaxis,
            labels: {
                ...baseChartTheme.yaxis,
                formatter: (v: number) => formatMinorAmount(v, currency),
            },
        },
        markers: { size: 0, hover: { size: 5 } },
        tooltip: {
            ...baseChartTheme.tooltip,
            y: { formatter: (v: number) => formatMinorAmount(v, currency) },
        },
    };

    return (
        <AdminPageLayout
            title="Revenue Overview"
            subtitle="Funding, fees, payouts and net revenue over a window"
            breadcrumbs={[{ label: 'Platform' }, { label: 'Revenue' }]}
        >
            <DateWindowBar range={range} onChange={setRange} />

            {error ? (
                <AdminError error={error} message={getApiErrorMessage(error, 'Could not load revenue.')} />
            ) : (
                <>
                    {data && <KpiStrip items={items} columns={{ base: 2, md: 4, xl: 4 }} />}

                    <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100">
                        <HStack justify="space-between" align="flex-start" mb={3}>
                            <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                                Revenue over time
                            </Text>
                            {data && (
                                <Text fontSize="md" fontWeight="bold" color="gray.900">
                                    {formatMinorAmount(data.grossFundingMinor, currency)}
                                </Text>
                            )}
                        </HStack>

                        {isLoading && !data ? (
                            <Center h="260px">
                                <Spinner size="sm" color="primary.500" />
                            </Center>
                        ) : series.length === 0 ? (
                            <Center h="260px">
                                <Text fontSize="xs" color="gray.500">
                                    No revenue recorded in this window yet.
                                </Text>
                            </Center>
                        ) : (
                            <ReactApexChart
                                options={options}
                                series={[{ name: 'Revenue', data: series.map((p) => p.amountMinor) }]}
                                height={260}
                                type="area"
                            />
                        )}
                    </Box>

                    <VStack align="stretch" gap={2}>
                        <Text fontSize="11px" fontWeight="semibold" color="gray.700" px={1}>
                            Revenue by type
                        </Text>
                        <DataTable
                            columns={typeColumns}
                            rows={data?.byType ?? []}
                            rowKey={(r) => r.type}
                            loading={isLoading && !data}
                            emptyIcon={FiDollarSign}
                            emptyTitle="No revenue by type"
                            emptyDescription="Nothing was recorded in this window."
                        />
                    </VStack>
                </>
            )}
        </AdminPageLayout>
    );
};

export default RevenueOverviewPage;
