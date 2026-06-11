import React from 'react';
import { HStack, Text, VStack } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { baseChartTheme } from '@/features/record-label/lib/chartTheme';
import { formatMinorAmount } from '../../../lib/format';
import { ChartCard } from '../ChartCard';
import { formatMinorCompact } from '../chartFormat';

interface NetRevenueWaterfallProps {
    grossMinor: number;
    feesMinor: number;
    payoutsMinor: number;
    currency: string;
    loading: boolean;
}

const STEP_COLORS = {
    gross: '#16A34A',
    fees: '#f94444',
    payouts: '#D97706',
    net: '#3B82F6',
};

/** Small colour-keyed caption shown beneath the bars. */
const LegendDot: React.FC<{ color: string; label: string; amount: string }> = ({
    color,
    label,
    amount,
}) => (
    <HStack gap={1.5} minW={0}>
        <VStack gap={0} align="start" minW={0}>
            <HStack gap={1}>
                <span
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: 9999,
                        backgroundColor: color,
                        display: 'inline-block',
                    }}
                />
                <Text fontSize="9px" color="gray.500" fontWeight="medium">
                    {label}
                </Text>
            </HStack>
            <Text fontSize="11px" fontWeight="bold" color="gray.900" lineClamp={1}>
                {amount}
            </Text>
        </VStack>
    </HStack>
);

/**
 * Finance-style bridge from gross coin funding to net platform revenue:
 * Gross → −Platform fees → −Creator payouts → Net. Floating range bars make
 * each deduction read as a step down to the bottom-line figure.
 */
export const NetRevenueWaterfall: React.FC<NetRevenueWaterfallProps> = ({
    grossMinor,
    feesMinor,
    payoutsMinor,
    currency,
    loading,
}) => {
    // Self-consistent remainder so the bridge is a true identity regardless of
    // how the backend computes its own "net" figure elsewhere.
    const netMinor = grossMinor - feesMinor - payoutsMinor;
    const hasData = grossMinor > 0 || feesMinor > 0 || payoutsMinor > 0;

    // Floating segments: [start, end]. Fees and payouts step the running total
    // down from gross to net; gross and net are full-height anchor bars.
    const afterFees = grossMinor - feesMinor;
    const data = [
        { x: 'Gross', y: [0, grossMinor], fillColor: STEP_COLORS.gross },
        { x: 'Fees', y: [afterFees, grossMinor], fillColor: STEP_COLORS.fees },
        { x: 'Payouts', y: [netMinor, afterFees], fillColor: STEP_COLORS.payouts },
        { x: 'Net', y: [0, netMinor], fillColor: STEP_COLORS.net },
    ];

    const options: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'rangeBar' },
        plotOptions: { bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 } },
        xaxis: { ...baseChartTheme.xaxis },
        yaxis: {
            ...baseChartTheme.yaxis,
            labels: {
                ...baseChartTheme.yaxis,
                formatter: (v: number) => formatMinorCompact(v, currency),
            },
        },
        tooltip: {
            ...baseChartTheme.tooltip,
            custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
                const amounts = [grossMinor, feesMinor, payoutsMinor, netMinor];
                const labels = ['Gross funding', 'Platform fees', 'Creator payouts', 'Net retained'];
                const signed = dataPointIndex === 1 || dataPointIndex === 2 ? '−' : '';
                return `<div style="padding:6px 10px;font-size:11px;font-family:Manrope,sans-serif">
                    <strong>${labels[dataPointIndex]}</strong><br/>${signed}${formatMinorAmount(
                        amounts[dataPointIndex],
                        currency,
                    )}</div>`;
            },
        },
    };

    return (
        <ChartCard
            title="Revenue bridge"
            subtitle="Gross coin funding less platform fees and creator payouts"
            headline={formatMinorAmount(netMinor, currency)}
            headlineCaption="Net retained in window"
            loading={loading}
            empty={!hasData}
            emptyText="No revenue recorded in this window yet."
            minH="280px"
        >
            <ReactApexChart
                options={options}
                series={[{ name: 'Amount', data }]}
                height={236}
                type="rangeBar"
            />
            <HStack
                justify="space-between"
                gap={2}
                pt={2}
                mt={1}
                borderTop="1px solid"
                borderColor="gray.100"
                flexWrap="wrap"
            >
                <LegendDot
                    color={STEP_COLORS.gross}
                    label="Gross funding"
                    amount={formatMinorAmount(grossMinor, currency)}
                />
                <LegendDot
                    color={STEP_COLORS.fees}
                    label="− Platform fees"
                    amount={formatMinorAmount(feesMinor, currency)}
                />
                <LegendDot
                    color={STEP_COLORS.payouts}
                    label="− Creator payouts"
                    amount={formatMinorAmount(payoutsMinor, currency)}
                />
                <LegendDot
                    color={STEP_COLORS.net}
                    label="= Net retained"
                    amount={formatMinorAmount(netMinor, currency)}
                />
            </HStack>
        </ChartCard>
    );
};
