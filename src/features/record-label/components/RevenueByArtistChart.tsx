import React, { useMemo } from 'react';
import { Box, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useLabelAnalytics, type AnalyticsRange } from '../hooks/useAnalytics';
import { baseChartTheme } from '../lib/chartTheme';
import { formatMinorAmount } from '../lib/format';

interface Props {
    currency: string;
}

const isoNDaysAgo = (n: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
};

export const RevenueByArtistChart: React.FC<Props> = ({ currency }) => {
    const range = useMemo<AnalyticsRange>(
        () => ({
            from: isoNDaysAgo(30),
            to: new Date().toISOString().slice(0, 10),
            granularity: 'day',
        }),
        [],
    );
    const { data, isLoading } = useLabelAnalytics(range);

    const top = (data?.revenueByArtist ?? []).slice(0, 6);

    const options: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'bar' },
        plotOptions: {
            bar: { columnWidth: '50%', borderRadius: 6, borderRadiusApplication: 'end' },
        },
        colors: ['#3B82F6'],
        xaxis: {
            ...baseChartTheme.xaxis,
            categories: top.map((a) => a.name),
        },
        yaxis: {
            labels: {
                style: { colors: '#7B91B0', fontFamily: 'Poppins', fontSize: '10px' },
                formatter: (v: number) => {
                    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
                    return v.toFixed(0);
                },
            },
        },
        tooltip: {
            ...baseChartTheme.tooltip,
            y: { formatter: (v: number) => formatMinorAmount(v * 100, currency) },
        },
    };
    const series = [
        {
            name: 'Revenue',
            data: top.map((a) => Math.round((a.revenueMinor || 0) / 100)),
        },
    ];

    return (
        <Box bg="white" p={4} borderRadius="2xl" borderWidth="1px" borderColor="gray.100" h="full">
            <VStack align="start" gap={0.5} mb={3}>
                <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                    Revenue by artist
                </Text>
                <Text fontSize="9px" color="gray.500">
                    Top earners over the last 30 days
                </Text>
            </VStack>

            {isLoading ? (
                <Center h="220px">
                    <Spinner size="sm" color="primary.500" />
                </Center>
            ) : top.length === 0 ? (
                <Center h="220px">
                    <Text fontSize="xs" color="gray.500">
                        No revenue yet this period.
                    </Text>
                </Center>
            ) : (
                <ReactApexChart options={options} series={series} height={220} type="bar" />
            )}
        </Box>
    );
};
