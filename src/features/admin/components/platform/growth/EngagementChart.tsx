import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { baseChartTheme } from '@/features/record-label/lib/chartTheme';
import type { Granularity, GrowthEngagementPoint } from '../../../types/platform';
import { ChartCard } from '../ChartCard';
import { formatBucket, formatCompact } from '../chartFormat';

interface EngagementChartProps {
    series: GrowthEngagementPoint[];
    granularity: Granularity;
    currentMau: number;
    loading: boolean;
}

/**
 * Active listeners per bucket with rolling 7/30-day distinct counts — the
 * DAU/WAU/MAU triple at day granularity.
 */
export const EngagementChart: React.FC<EngagementChartProps> = ({
    series,
    granularity,
    currentMau,
    loading,
}) => {
    const hasData = series.some((p) => p.activeUsers > 0 || p.rollingMau > 0);

    const options: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'line' },
        colors: ['#f94444', '#3B82F6', '#16A34A'],
        stroke: { curve: 'smooth', width: [2.5, 2, 2], dashArray: [0, 0, 4] },
        fill: {
            type: ['gradient', 'solid', 'solid'],
            gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.03, stops: [0, 100] },
        },
        legend: {
            show: true,
            position: 'bottom',
            fontSize: '11px',
            labels: { colors: '#7B91B0' },
            markers: { size: 5 },
        },
        xaxis: {
            ...baseChartTheme.xaxis,
            categories: series.map((p) => formatBucket(p.date, granularity)),
            tickAmount: 8,
        },
        yaxis: {
            ...baseChartTheme.yaxis,
            labels: {
                ...baseChartTheme.yaxis,
                formatter: (v: number) => formatCompact(v),
            },
        },
        markers: { size: 0, hover: { size: 5 } },
        tooltip: { ...baseChartTheme.tooltip, shared: true, intersect: false },
    };

    return (
        <ChartCard
            title="Active users"
            subtitle="Distinct listeners per bucket with rolling 7/30-day windows"
            headline={formatCompact(currentMau)}
            headlineCaption="30-day actives"
            loading={loading}
            empty={!hasData}
            emptyText="No listening activity recorded in this window yet."
            minH="280px"
        >
            <ReactApexChart
                options={options}
                series={[
                    { name: 'Active users', type: 'area', data: series.map((p) => p.activeUsers) },
                    { name: '7-day actives', type: 'line', data: series.map((p) => p.rollingWau) },
                    {
                        name: '30-day actives',
                        type: 'line',
                        data: series.map((p) => p.rollingMau),
                    },
                ]}
                height={280}
                type="line"
            />
        </ChartCard>
    );
};
