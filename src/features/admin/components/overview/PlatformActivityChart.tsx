import React, { useMemo } from 'react';
import { Box, Center, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { baseChartTheme } from '@/features/record-label/lib/chartTheme';
import { useActivitySeries } from '../../hooks/useAdminOverview';
import { isoDaysAgo, todayIso } from '../../lib/format';
import type { ActivityRange } from '../../types';

const formatBucket = (iso: string): string => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/** Platform-wide new-signups area chart for the last 30 days. */
export const PlatformActivityChart: React.FC = () => {
    const range = useMemo<ActivityRange>(
        () => ({ from: isoDaysAgo(30), to: todayIso(), granularity: 'day' }),
        [],
    );
    const { data, isLoading } = useActivitySeries(range);

    const series = data?.signupsSeries ?? [];
    const total = series.reduce((sum, b) => sum + b.count, 0);

    const options: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'area' },
        stroke: { curve: 'smooth', width: 2.5 },
        colors: ['#f94444'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.35,
                opacityTo: 0.05,
                stops: [0, 100],
            },
        },
        xaxis: {
            ...baseChartTheme.xaxis,
            categories: series.map((b) => formatBucket(b.bucket)),
            tickAmount: 6,
        },
        markers: { size: 0, hover: { size: 5 } },
    };

    return (
        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100">
            <HStack justify="space-between" align="flex-start" mb={3}>
                <VStack align="start" gap={0.5}>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                        New signups
                    </Text>
                    <Text fontSize="9px" color="gray.500">
                        Across the platform · last 30 days
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

            {isLoading ? (
                <Center h="260px">
                    <Spinner size="sm" color="primary.500" />
                </Center>
            ) : total === 0 ? (
                <Center h="260px">
                    <Text fontSize="xs" color="gray.500">
                        No signups in the last 30 days yet.
                    </Text>
                </Center>
            ) : (
                <ReactApexChart
                    options={options}
                    series={[{ name: 'Signups', data: series.map((b) => b.count) }]}
                    height={260}
                    type="area"
                />
            )}
        </Box>
    );
};
