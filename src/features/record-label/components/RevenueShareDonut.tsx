import React, { useMemo } from 'react';
import { Box, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useLabelAnalytics, type AnalyticsRange } from '../hooks/useAnalytics';
import { formatMinorAmount } from '../lib/format';

interface Props {
    currency: string;
}

const isoNDaysAgo = (n: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
};

const PALETTE = ['#f94444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#94A3B8'];

export const RevenueShareDonut: React.FC<Props> = ({ currency }) => {
    const range = useMemo<AnalyticsRange>(
        () => ({
            from: isoNDaysAgo(30),
            to: new Date().toISOString().slice(0, 10),
            granularity: 'day',
        }),
        [],
    );
    const { data, isLoading } = useLabelAnalytics(range);

    const all = (data?.revenueByArtist ?? []).filter((a) => a.revenueMinor > 0);
    const top = all.slice(0, 5);
    const rest = all.slice(5).reduce((s, a) => s + a.revenueMinor, 0);

    const labels = [...top.map((a) => a.name), ...(rest > 0 ? ['Other'] : [])];
    const values = [...top.map((a) => a.revenueMinor / 100), ...(rest > 0 ? [rest / 100] : [])];
    const total = values.reduce((s, v) => s + v, 0);

    const options: ApexOptions = {
        chart: { type: 'donut', toolbar: { show: false }, fontFamily: 'Manrope, sans-serif' },
        labels,
        colors: PALETTE.slice(0, labels.length),
        legend: { show: false },
        stroke: { width: 0 },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        name: { fontSize: '10px', color: '#7B91B0', fontFamily: 'Poppins' },
                        value: {
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#0F3659',
                            formatter: (v: string) => formatMinorAmount(Number(v) * 100, currency),
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '10px',
                            color: '#7B91B0',
                            fontFamily: 'Poppins',
                            formatter: () => formatMinorAmount(total * 100, currency),
                        },
                    },
                },
            },
        },
        tooltip: {
            style: { fontFamily: 'Manrope', fontSize: '11px' },
            y: { formatter: (v: number) => formatMinorAmount(v * 100, currency) },
        },
    };

    return (
        <Box bg="white" p={4} borderRadius="2xl" borderWidth="1px" borderColor="gray.100" h="full">
            <VStack align="start" gap={0.5} mb={2}>
                <Text fontSize="11px" fontWeight="semibold" color="gray.900">
                    Revenue concentration
                </Text>
                <Text fontSize="9px" color="gray.500">
                    Top 5 vs. the rest
                </Text>
            </VStack>

            {isLoading ? (
                <Center h="220px">
                    <Spinner size="sm" color="primary.500" />
                </Center>
            ) : labels.length === 0 ? (
                <Center h="220px">
                    <Text fontSize="xs" color="gray.500">
                        No revenue yet to break down.
                    </Text>
                </Center>
            ) : (
                <>
                    <ReactApexChart options={options} series={values} height={200} type="donut" />
                    <VStack align="stretch" gap={1.5} mt={2}>
                        {labels.map((l, i) => (
                            <Box
                                key={l}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Box
                                        w="8px"
                                        h="8px"
                                        borderRadius="full"
                                        bg={PALETTE[i % PALETTE.length]}
                                    />
                                    <Text fontSize="10px" color="gray.700">
                                        {l}
                                    </Text>
                                </Box>
                                <Text fontSize="10px" color="gray.500" fontWeight="medium">
                                    {total > 0 ? `${((values[i] / total) * 100).toFixed(0)}%` : '—'}
                                </Text>
                            </Box>
                        ))}
                    </VStack>
                </>
            )}
        </Box>
    );
};
