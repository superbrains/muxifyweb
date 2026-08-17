import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCount } from '@shared/console/lib/format';
import type { RiskBreakdownSlice } from '../../../types/platform';
import { ChartCard } from '../ChartCard';
import { humanizeLabel } from './riskFormat';

interface RiskBreakdownDonutProps {
    title: string;
    subtitle: string;
    slices: RiskBreakdownSlice[];
    /** Noun for the tooltip/headline, e.g. "reports" or "disputes". */
    unit: string;
    colors: string[];
    loading: boolean;
    emptyText: string;
}

/**
 * Compositional donut for the risk breakdowns — what kind of content is being
 * reported, or which stage open disputes are stuck in. Slice order follows the
 * backend (already sorted by volume) so the dominant category leads the legend.
 */
export const RiskBreakdownDonut: React.FC<RiskBreakdownDonutProps> = ({
    title,
    subtitle,
    slices,
    unit,
    colors,
    loading,
    emptyText,
}) => {
    const data = slices.filter((s) => s.count > 0);
    const hasData = data.length > 0;
    const total = data.reduce((sum, s) => sum + s.count, 0);

    const options: ApexOptions = {
        chart: { fontFamily: 'Manrope, sans-serif', toolbar: { show: false } },
        labels: data.map((s) => humanizeLabel(s.label)),
        colors,
        legend: { position: 'bottom', fontSize: '11px', labels: { colors: '#7B91B0' } },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        tooltip: { y: { formatter: (v: number) => `${formatCount(v)} ${unit}` } },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '10px',
                            color: '#7B91B0',
                            formatter: () => formatCount(total),
                        },
                        value: { fontSize: '20px', fontWeight: 700, color: '#1A202C' },
                    },
                },
            },
        },
    };

    return (
        <ChartCard
            title={title}
            subtitle={subtitle}
            headline={hasData ? humanizeLabel(data[0].label) : undefined}
            headlineCaption={hasData ? `${formatCount(data[0].count)} ${unit}` : undefined}
            loading={loading}
            empty={!hasData}
            emptyText={emptyText}
            minH="260px"
        >
            <ReactApexChart options={options} series={data.map((s) => s.count)} type="donut" height={260} />
        </ChartCard>
    );
};
