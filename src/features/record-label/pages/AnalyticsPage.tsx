import React, { useMemo } from 'react';
import {
    Box,
    Center,
    Flex,
    Spinner,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useLabelAnalytics, type AnalyticsRange } from '../hooks/useAnalytics';
import { formatMinorAmount } from '../lib/format';
import { baseChartTheme } from '../lib/chartTheme';

const isoNDaysAgo = (n: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
};

const defaultRange = (): AnalyticsRange => ({
    from: isoNDaysAgo(30),
    to: new Date().toISOString().slice(0, 10),
    granularity: 'day',
});

const baseAxisStyle: ApexOptions = baseChartTheme;

const AnalyticsPage: React.FC = () => {
    const range = useMemo(defaultRange, []);
    const { data, isLoading } = useLabelAnalytics(range);

    if (isLoading) {
        return (
            <Center minH="60vh" bg="gray.50">
                <Spinner size="lg" color="primary.500" />
            </Center>
        );
    }

    if (!data) {
        return (
            <Center minH="60vh" bg="gray.50">
                <Text fontSize="sm" color="gray.500">
                    No analytics yet. Once your roster has plays this view will populate.
                </Text>
            </Center>
        );
    }

    const streamsOptions: ApexOptions = {
        ...baseAxisStyle,
        chart: { ...baseAxisStyle.chart, type: 'line' },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#f94444'],
        xaxis: { ...baseAxisStyle.xaxis, categories: data.streamsSeries.map((d) => d.bucket) },
    };
    const streamsSeries = [
        { name: 'Streams', data: data.streamsSeries.map((d) => d.streams) },
    ];

    const revenueOptions: ApexOptions = {
        ...baseAxisStyle,
        chart: { ...baseAxisStyle.chart, type: 'bar' },
        plotOptions: { bar: { columnWidth: '60%', borderRadius: 4 } },
        colors: ['#3B82F6'],
        xaxis: {
            ...baseAxisStyle.xaxis,
            categories: data.revenueByArtist.map((a) => a.name),
        },
    };
    const revenueSeries = [
        {
            name: 'Revenue',
            data: data.revenueByArtist.map((a) => Math.round((a.revenueMinor || 0) / 100)),
        },
    ];

    return (
        <VStack
            gap={{ base: 2, lg: 6 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.900" fontFamily="Poppins">
                    Label Analytics
                </Text>
                <Text fontSize="11px" color="gray.600">
                    Last 30 days across your roster
                </Text>
            </Box>

            <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                <Box flex={1} bg="white" p={4} borderRadius="xl">
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900" mb={2}>
                        Streams over time
                    </Text>
                    <ReactApexChart
                        options={streamsOptions}
                        series={streamsSeries}
                        height={260}
                        type="line"
                    />
                </Box>
                <Box flex={1} bg="white" p={4} borderRadius="xl">
                    <Text fontSize="11px" fontWeight="semibold" color="gray.900" mb={2}>
                        Revenue by artist
                    </Text>
                    <ReactApexChart
                        options={revenueOptions}
                        series={revenueSeries}
                        height={260}
                        type="bar"
                    />
                </Box>
            </Flex>

            <Box bg="white" p={4} borderRadius="xl">
                <Text fontSize="11px" fontWeight="semibold" color="gray.900" mb={3}>
                    Top tracks
                </Text>
                <Stack gap={0}>
                    {data.topTracks.map((t) => (
                        <Flex
                            key={t.trackId}
                            py={2}
                            px={2}
                            justify="space-between"
                            _hover={{ bg: 'primary.50' }}
                            borderRadius="md"
                        >
                            <Box>
                                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                                    {t.title}
                                </Text>
                                <Text fontSize="10px" color="gray.500">
                                    {t.artistName}
                                </Text>
                            </Box>
                            <Box textAlign="right">
                                <Text fontSize="xs" color="gray.700">
                                    {t.streams.toLocaleString()} streams
                                </Text>
                                <Text fontSize="10px" color="gray.500">
                                    {formatMinorAmount(t.revenueMinor, 'NGN')}
                                </Text>
                            </Box>
                        </Flex>
                    ))}
                </Stack>
            </Box>
        </VStack>
    );
};

export default AnalyticsPage;
