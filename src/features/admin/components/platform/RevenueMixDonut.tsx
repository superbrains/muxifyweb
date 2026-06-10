import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatMinorAmount } from '../../lib/format';
import type { RevenueMixSlice } from '../../types/platform';
import { ChartCard } from './ChartCard';

const TYPE_LABELS: Record<string, string> = {
    Gift: 'Gifts',
    ContentUnlock: 'Content unlocks',
    Streaming: 'Streaming',
    Bonus: 'Bonuses',
    Referral: 'Referrals',
};

/** "ContentUnlock" → "Content unlocks" (known types), else split camelCase. */
const humanizeType = (type: string): string =>
    TYPE_LABELS[type] ?? type.replace(/([a-z])([A-Z])/g, '$1 $2');

const COLORS = ['#7C3AED', '#3B82F6', '#16A34A', '#D97706', '#E53E3E', '#0EA5E9'];

interface RevenueMixDonutProps {
    mix: RevenueMixSlice[];
    currency: string;
    loading: boolean;
}

/** How earnings in the window break down by source (gifts, unlocks, streaming…). */
export const RevenueMixDonut: React.FC<RevenueMixDonutProps> = ({ mix, currency, loading }) => {
    const slices = mix.filter((s) => s.amountMinor > 0);
    const hasData = slices.length > 0;

    const options: ApexOptions = {
        chart: { fontFamily: 'Manrope, sans-serif', toolbar: { show: false } },
        labels: slices.map((s) => humanizeType(s.type)),
        colors: COLORS,
        legend: { position: 'bottom', fontSize: '11px', labels: { colors: '#7B91B0' } },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        tooltip: { y: { formatter: (v: number) => formatMinorAmount(v, currency) } },
        plotOptions: { pie: { donut: { size: '68%' } } },
    };

    return (
        <ChartCard
            title="Revenue mix"
            subtitle="Earnings in the window by source"
            loading={loading}
            empty={!hasData}
            emptyText="No earnings recorded in this window yet."
            minH="220px"
        >
            <ReactApexChart
                options={options}
                series={slices.map((s) => s.amountMinor)}
                type="donut"
                height={220}
            />
        </ChartCard>
    );
};
