import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCount, formatMinorAmount } from '@shared/console/lib/format';
import type { BusinessAnalytics } from '../../types/platform';
import { ChartCard } from './ChartCard';

const StatRow: React.FC<{ label: string; value: string; hint?: string }> = ({
    label,
    value,
    hint,
}) => (
    <HStack justify="space-between" py={2} borderBottom="1px solid" borderColor="gray.50">
        <VStack align="start" gap={0}>
            <Text fontSize="10px" color="gray.600" fontWeight="medium">
                {label}
            </Text>
            {hint && (
                <Text fontSize="8px" color="gray.400">
                    {hint}
                </Text>
            )}
        </VStack>
        <Text fontSize="xs" fontWeight="bold" color="gray.900">
            {value}
        </Text>
    </HStack>
);

interface EconomyStatsCardProps {
    data: BusinessAnalytics;
    loading: boolean;
}

/** Take-rate radial plus the unit-economics numbers that don't fit a chart. */
export const EconomyStatsCard: React.FC<EconomyStatsCardProps> = ({ data, loading }) => {
    const radialOptions: ApexOptions = {
        chart: { fontFamily: 'Manrope, sans-serif', toolbar: { show: false } },
        colors: ['#f94444'],
        labels: ['Platform take rate'],
        plotOptions: {
            radialBar: {
                hollow: { size: '60%' },
                dataLabels: {
                    name: { fontSize: '11px', color: '#7B91B0' },
                    value: {
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#0F3659',
                        formatter: (v: number) => `${v}%`,
                    },
                },
            },
        },
    };

    return (
        <ChartCard
            title="Unit economics"
            subtitle="Take rate, conversion and purchase activity"
            loading={loading}
            minH="180px"
        >
            <ReactApexChart
                options={radialOptions}
                series={[data.feeRatePct]}
                type="radialBar"
                height={170}
            />
            <Box mt={1}>
                <StatRow
                    label="Paying conversion"
                    hint="Paying users / all users"
                    value={`${data.conversionPct.toFixed(1)}%`}
                />
                <StatRow
                    label="ARPU"
                    hint="Revenue / all users"
                    value={formatMinorAmount(data.arpuMinor, data.currency)}
                />
                <StatRow label="Coin purchases" value={formatCount(data.purchasesCount)} />
                <StatRow label="Gross coin volume" value={formatCount(data.grossCoinVolume)} />
            </Box>
        </ChartCard>
    );
};
