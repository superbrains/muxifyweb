import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { baseChartTheme } from '@/features/record-label/lib/chartTheme';
import { formatCount } from '@shared/console/lib/format';
import type { BusinessSeriesPoint, Granularity } from '../../types/platform';
import { ChartCard } from './ChartCard';
import { formatBucket, formatCompact } from './chartFormat';

interface CoinEconomyChartProps {
    series: BusinessSeriesPoint[];
    granularity: Granularity;
    loading: boolean;
}

/**
 * Coin sources vs sinks — coins bought into the economy against coins spent on
 * gifts and unlocks. Coins only; cash figures live on the revenue chart.
 */
export const CoinEconomyChart: React.FC<CoinEconomyChartProps> = ({
    series,
    granularity,
    loading,
}) => {
    const totalPurchased = series.reduce((sum, p) => sum + p.coinsPurchased, 0);
    const hasData = series.some((p) => p.coinsPurchased > 0 || p.coinsSpent > 0);

    const options: ApexOptions = {
        ...baseChartTheme,
        chart: { ...baseChartTheme.chart, type: 'bar', stacked: false },
        colors: ['#3B82F6', '#D97706'],
        plotOptions: { bar: { columnWidth: '55%', borderRadius: 3 } },
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
            labels: { ...baseChartTheme.yaxis, formatter: (v: number) => formatCompact(v) },
        },
        tooltip: {
            ...baseChartTheme.tooltip,
            shared: true,
            intersect: false,
            y: { formatter: (v: number) => `${formatCount(v)} coins` },
        },
    };

    return (
        <ChartCard
            title="Coin economy"
            subtitle="Coins purchased into the economy vs coins spent on gifts & unlocks"
            headline={formatCount(totalPurchased)}
            headlineCaption="Coins purchased in window"
            loading={loading}
            empty={!hasData}
            emptyText="No coin activity in this window yet."
        >
            <ReactApexChart
                options={options}
                series={[
                    { name: 'Coins purchased', data: series.map((p) => p.coinsPurchased) },
                    { name: 'Coins spent', data: series.map((p) => p.coinsSpent) },
                ]}
                height={260}
                type="bar"
            />
        </ChartCard>
    );
};
