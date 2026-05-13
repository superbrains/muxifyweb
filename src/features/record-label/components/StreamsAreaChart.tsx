import React, { useMemo } from 'react';
import { Box, Center, HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useLabelAnalytics, type AnalyticsRange } from '../hooks/useAnalytics';
import { baseChartTheme } from '../lib/chartTheme';

const isoNDaysAgo = (n: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
};

const formatBucket = (iso: string): string => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const StreamsAreaChart: React.FC = () => {
    const range = useMemo<AnalyticsRange>(
        () => ({
            from: isoNDaysAgo(30),
            to: new Date().toISOString().slice(0, 10),
            granularity: 'day',
        }),
        [],
    );
    const { data, isLoading } = useLabelAnalytics(range);

    const totalStreams = data?.streamsSeries.reduce((sum, b) => sum + b.streams, 0) ?? 0;

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
            categories: (data?.streamsSeries ?? []).map((b) => formatBucket(b.bucket)),
            tickAmount: 6,
        },
        markers: { size: 0, hover: { size: 5 } },
    };
    const series = [
        {
            name: 'Streams',
            data: (data?.streamsSeries ?? []).map((b) => b.streams),
        },
    ];

    return (
        <Box bg="white" p={4} borderRadius="2xl" borderWidth="1px" borderColor="gray.100">
            <HStack justify="space-between" align="flex-start" mb={3}>
                <VStack align="start" gap={0.5}>
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                        Streams over time
                    </Text>
                    <Text fontSize="9px" color="gray.500">
                        Last 30 days across your roster
                    </Text>
                </VStack>
                <VStack align="end" gap={0}>
                    <Text fontSize="md" fontWeight="bold" color="gray.900">
                        {totalStreams.toLocaleString()}
                    </Text>
                    <Text fontSize="9px" color="gray.500">
                        Total streams
                    </Text>
                </VStack>
            </HStack>

            {isLoading ? (
                <Center h="240px">
                    <Spinner size="sm" color="primary.500" />
                </Center>
            ) : totalStreams === 0 ? (
                <Center h="240px">
                    <Text fontSize="xs" color="gray.500">
                        No streams in the last 30 days yet.
                    </Text>
                </Center>
            ) : (
                <ReactApexChart options={options} series={series} height={240} type="area" />
            )}
        </Box>
    );
};
