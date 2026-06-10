import React from 'react';
import { Box, Button, Center, HStack, Text } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { baseChartTheme } from '@/features/record-label/lib/chartTheme';
import { formatCount } from '../../../lib/format';
import type { Granularity, GrowthSignupPoint } from '../../../types/platform';
import { ChartCard } from '../ChartCard';
import { formatBucket, formatCompact } from '../chartFormat';

type Mode = 'new' | 'cumulative';

const MODES: { key: Mode; label: string }[] = [
    { key: 'new', label: 'New' },
    { key: 'cumulative', label: 'Cumulative' },
];

interface SignupsTrendChartProps {
    series: GrowthSignupPoint[];
    granularity: Granularity;
    loading: boolean;
}

/**
 * Hero chart — new signups per bucket with a dashed previous-period overlay,
 * or the cumulative user base. The toggle lives inside the card so an empty
 * "new" view can still switch to cumulative.
 */
export const SignupsTrendChart: React.FC<SignupsTrendChartProps> = ({
    series,
    granularity,
    loading,
}) => {
    const [mode, setMode] = React.useState<Mode>('new');

    const total = series.reduce((sum, p) => sum + p.signups, 0);
    const lastCumulative = series.length > 0 ? series[series.length - 1].cumulativeUsers : 0;
    const hasPrevious = series.some(
        (p) => p.previousSignups !== null && p.previousSignups !== undefined,
    );
    const hasData = mode === 'new' ? total > 0 : lastCumulative > 0;

    const categories = series.map((p) => formatBucket(p.date, granularity));

    const newOptions: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'line' },
        colors: ['#f94444', '#94A3B8'],
        stroke: { curve: 'smooth', width: [2.5, 1.5], dashArray: [0, 5] },
        fill: {
            type: ['gradient', 'solid'],
            gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] },
        },
        legend: hasPrevious
            ? {
                  show: true,
                  position: 'bottom',
                  fontSize: '11px',
                  labels: { colors: '#7B91B0' },
                  markers: { size: 5 },
              }
            : { show: false },
        xaxis: { ...baseChartTheme.xaxis, categories, tickAmount: 8 },
        markers: { size: 0, hover: { size: 5 } },
        tooltip: { ...baseChartTheme.tooltip, shared: true, intersect: false },
    };

    const cumulativeOptions: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'area' },
        colors: ['#3B82F6'],
        stroke: { curve: 'smooth', width: 2.5 },
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0.03, stops: [0, 100] },
        },
        xaxis: { ...baseChartTheme.xaxis, categories, tickAmount: 8 },
        yaxis: {
            ...baseChartTheme.yaxis,
            labels: {
                ...baseChartTheme.yaxis,
                formatter: (v: number) => formatCompact(v),
            },
        },
        markers: { size: 0, hover: { size: 5 } },
    };

    const newSeries = [
        { name: 'New signups', type: 'area' as const, data: series.map((p) => p.signups) },
        ...(hasPrevious
            ? [
                  {
                      name: 'Previous period',
                      type: 'line' as const,
                      data: series.map((p) => p.previousSignups ?? null),
                  },
              ]
            : []),
    ];

    return (
        <ChartCard
            title="Signups over time"
            subtitle="New registrations per bucket against the previous equal-length window"
            headline={mode === 'new' ? formatCount(total) : formatCount(lastCumulative)}
            headlineCaption={mode === 'new' ? 'Signups in window' : 'Total users at window end'}
            loading={loading}
            minH="300px"
        >
            <HStack gap={1} p={0.5} bg="gray.100" borderRadius="lg" w="fit-content" mb={2}>
                {MODES.map((m) => {
                    const isActive = mode === m.key;
                    return (
                        <Button
                            key={m.key}
                            size="xs"
                            h="24px"
                            px={2.5}
                            fontSize="10px"
                            fontWeight={isActive ? 'bold' : 'medium'}
                            bg={isActive ? 'white' : 'transparent'}
                            color={isActive ? 'gray.900' : 'gray.500'}
                            border="1px solid"
                            borderColor={isActive ? 'gray.200' : 'transparent'}
                            borderRadius="md"
                            _hover={{ bg: isActive ? 'white' : 'gray.50', color: 'gray.800' }}
                            onClick={() => setMode(m.key)}
                        >
                            {m.label}
                        </Button>
                    );
                })}
            </HStack>

            {!hasData ? (
                <Center h="260px">
                    <Text fontSize="xs" color="gray.500">
                        No signups recorded in this window yet.
                    </Text>
                </Center>
            ) : mode === 'new' ? (
                <Box>
                    <ReactApexChart options={newOptions} series={newSeries} height={272} type="line" />
                </Box>
            ) : (
                <Box>
                    <ReactApexChart
                        options={cumulativeOptions}
                        series={[
                            { name: 'Total users', data: series.map((p) => p.cumulativeUsers) },
                        ]}
                        height={272}
                        type="area"
                    />
                </Box>
            )}
        </ChartCard>
    );
};
