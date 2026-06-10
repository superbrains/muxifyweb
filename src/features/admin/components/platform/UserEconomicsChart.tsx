import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { baseChartTheme } from '@/features/record-label/lib/chartTheme';
import { formatCount } from '../../lib/format';
import type { BusinessSeriesPoint, Granularity } from '../../types/platform';
import { ChartCard } from './ChartCard';
import { formatBucket } from './chartFormat';

interface UserEconomicsChartProps {
    series: BusinessSeriesPoint[];
    granularity: Granularity;
    loading: boolean;
}

/** Connects growth to monetization — new signups against users who actually paid. */
export const UserEconomicsChart: React.FC<UserEconomicsChartProps> = ({
    series,
    granularity,
    loading,
}) => {
    const totalSignups = series.reduce((sum, p) => sum + p.signups, 0);
    const hasData = series.some((p) => p.signups > 0 || p.payingUsers > 0);

    const options: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'line' },
        colors: ['#f94444', '#16A34A'],
        stroke: { curve: 'smooth', width: [2.5, 2] },
        fill: {
            type: ['gradient', 'solid'],
            gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.04, stops: [0, 100] },
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
        markers: { size: 0, hover: { size: 5 } },
        tooltip: {
            ...baseChartTheme.tooltip,
            shared: true,
            intersect: false,
            y: { formatter: (v: number) => formatCount(v) },
        },
    };

    return (
        <ChartCard
            title="User economics"
            subtitle="New signups vs distinct paying users per bucket"
            headline={formatCount(totalSignups)}
            headlineCaption="Signups in window"
            loading={loading}
            empty={!hasData}
            emptyText="No user activity in this window yet."
        >
            <ReactApexChart
                options={options}
                series={[
                    { name: 'New signups', type: 'area', data: series.map((p) => p.signups) },
                    { name: 'Paying users', type: 'line', data: series.map((p) => p.payingUsers) },
                ]}
                height={260}
                type="line"
            />
        </ChartCard>
    );
};
