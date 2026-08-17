import React from 'react';
import { Box } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { baseChartTheme } from '@/features/record-label/lib/chartTheme';
import { formatCount } from '@shared/console/lib/format';
import type { RiskTrendPoint } from '../../../types/platform';
import { ChartCard } from '../ChartCard';
import { formatBucket } from '../chartFormat';

interface RiskSignalsTrendChartProps {
    trend: RiskTrendPoint[];
    loading: boolean;
}

const SERIES_META = [
    { name: 'Content reports', key: 'contentReports' as const, color: '#D97706' },
    { name: 'Disputes', key: 'disputes' as const, color: '#E11D48' },
    { name: 'Duplicate matches', key: 'duplicates' as const, color: '#7C3AED' },
];

/**
 * Inflow chart — the volume of newly-raised risk signals per day over the last
 * fortnight. Reads as an early-warning line: a rising slope means work is
 * arriving faster than it can be cleared, well before the open backlog spikes.
 */
export const RiskSignalsTrendChart: React.FC<RiskSignalsTrendChartProps> = ({ trend, loading }) => {
    const total = trend.reduce((sum, p) => sum + p.contentReports + p.disputes + p.duplicates, 0);
    const categories = trend.map((p) => formatBucket(p.date, 'day'));

    const options: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'area', stacked: false },
        colors: SERIES_META.map((s) => s.color),
        stroke: { curve: 'smooth', width: 2 },
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.18, opacityTo: 0.02, stops: [0, 100] },
        },
        legend: {
            show: true,
            position: 'bottom',
            fontSize: '11px',
            labels: { colors: '#7B91B0' },
            markers: { size: 5 },
        },
        xaxis: { ...baseChartTheme.xaxis, categories, tickAmount: 7 },
        yaxis: {
            ...baseChartTheme.yaxis,
            labels: { ...baseChartTheme.yaxis, formatter: (v: number) => `${Math.round(v)}` },
        },
        markers: { size: 0, hover: { size: 5 } },
        tooltip: { ...baseChartTheme.tooltip, shared: true, intersect: false },
    };

    const series = SERIES_META.map((s) => ({
        name: s.name,
        data: trend.map((p) => p[s.key]),
    }));

    return (
        <ChartCard
            title="Risk signal inflow"
            subtitle="New reports, disputes and duplicate matches per day · last 14 days"
            headline={formatCount(total)}
            headlineCaption="Signals raised"
            loading={loading}
            empty={total === 0}
            emptyText="No new risk signals in the last 14 days."
            minH="300px"
        >
            <Box>
                <ReactApexChart options={options} series={series} type="area" height={280} />
            </Box>
        </ChartCard>
    );
};
