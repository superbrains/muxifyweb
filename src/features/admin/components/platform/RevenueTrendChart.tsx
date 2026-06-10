import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { baseChartTheme } from '@/features/record-label/lib/chartTheme';
import { formatMinorAmount } from '../../lib/format';
import type { BusinessSeriesPoint, Granularity } from '../../types/platform';
import { ChartCard } from './ChartCard';
import { formatBucket } from './chartFormat';

interface RevenueTrendChartProps {
    series: BusinessSeriesPoint[];
    granularity: Granularity;
    currency: string;
    loading: boolean;
}

/**
 * Hero chart — gross revenue (area) against platform fees and payouts (lines),
 * all in minor currency units on a shared bucket axis.
 */
export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
    series,
    granularity,
    currency,
    loading,
}) => {
    const totalRevenue = series.reduce((sum, p) => sum + p.revenueMinor, 0);
    const hasData = series.some((p) => p.revenueMinor > 0 || p.feesMinor > 0 || p.payoutsMinor > 0);

    const options: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'line' },
        colors: ['#16A34A', '#f94444', '#3B82F6'],
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
                formatter: (v: number) => formatMinorAmount(v, currency),
            },
        },
        markers: { size: 0, hover: { size: 5 } },
        tooltip: {
            ...baseChartTheme.tooltip,
            shared: true,
            intersect: false,
            y: { formatter: (v: number) => formatMinorAmount(v, currency) },
        },
    };

    return (
        <ChartCard
            title="Revenue, fees & payouts"
            subtitle="Gross coin funding against platform fees earned and cash paid out"
            headline={formatMinorAmount(totalRevenue, currency)}
            headlineCaption="Gross revenue in window"
            loading={loading}
            empty={!hasData}
            emptyText="No revenue recorded in this window yet."
            minH="300px"
        >
            <ReactApexChart
                options={options}
                series={[
                    { name: 'Gross revenue', type: 'area', data: series.map((p) => p.revenueMinor) },
                    { name: 'Platform fees', type: 'line', data: series.map((p) => p.feesMinor) },
                    { name: 'Payouts', type: 'line', data: series.map((p) => p.payoutsMinor) },
                ]}
                height={300}
                type="line"
            />
        </ChartCard>
    );
};
