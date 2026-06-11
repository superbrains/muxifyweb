import React from 'react';
import { Box } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { baseChartTheme } from '@/features/record-label/lib/chartTheme';
import { formatCount } from '../../../lib/format';
import type { TodayQueueTrendPoint } from '../../../types/platform';
import { ChartCard } from '../ChartCard';
import { formatBucket } from '../chartFormat';

interface QueueInflowChartProps {
    trend: TodayQueueTrendPoint[];
    loading: boolean;
}

/**
 * Work-arrival chart — how many new items landed in the queues each day over the
 * last fortnight. A rising slope is the early signal that inflow is outpacing the
 * team and the open backlog is about to climb.
 */
export const QueueInflowChart: React.FC<QueueInflowChartProps> = ({ trend, loading }) => {
    const total = trend.reduce((sum, p) => sum + p.added, 0);
    const categories = trend.map((p) => formatBucket(p.date, 'day'));

    const options: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'area', stacked: false },
        colors: ['#F94444'],
        stroke: { curve: 'smooth', width: 2.5 },
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.32, opacityTo: 0.03, stops: [0, 100] },
        },
        dataLabels: { enabled: false },
        xaxis: { ...baseChartTheme.xaxis, categories, tickAmount: 7 },
        yaxis: {
            ...baseChartTheme.yaxis,
            labels: { ...baseChartTheme.yaxis, formatter: (v: number) => `${Math.round(v)}` },
        },
        markers: { size: 0, hover: { size: 5 } },
        tooltip: {
            ...baseChartTheme.tooltip,
            y: { formatter: (v: number) => `${formatCount(v)} new items` },
        },
    };

    const series = [{ name: 'Items added', data: trend.map((p) => p.added) }];

    return (
        <ChartCard
            title="Work arriving"
            subtitle="New items landing across every queue per day · last 14 days"
            headline={formatCount(total)}
            headlineCaption="Items added"
            loading={loading}
            empty={total === 0}
            emptyText="No new work arrived in the last 14 days."
            minH="300px"
        >
            <Box>
                <ReactApexChart options={options} series={series} type="area" height={280} />
            </Box>
        </ChartCard>
    );
};
