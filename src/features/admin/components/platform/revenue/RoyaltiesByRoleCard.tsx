import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCount, formatMinorAmount } from '../../../lib/format';
import type { RoyaltiesSummaryDto } from '../../../types/monetization';
import { ChartCard } from '../ChartCard';

const ROLE_COLORS: Record<string, string> = {
    Artist: '#f94444',
    Label: '#3B82F6',
    Featured: '#7C3AED',
    Producer: '#16A34A',
    Songwriter: '#D97706',
};

const FALLBACK_COLORS = ['#0EA5E9', '#E53E3E', '#94A3B8'];

interface RoyaltiesByRoleCardProps {
    data?: RoyaltiesSummaryDto;
    loading: boolean;
}

/**
 * How creator royalties (the net paid out to rights-holders) split across split
 * roles — artists, labels, featured artists, producers and songwriters.
 */
export const RoyaltiesByRoleCard: React.FC<RoyaltiesByRoleCardProps> = ({ data, loading }) => {
    const currency = data?.currency ?? 'NGN';
    const slices = [...(data?.byRole ?? [])]
        .filter((r) => r.allocatedMinor > 0)
        .sort((a, b) => b.allocatedMinor - a.allocatedMinor);
    const hasData = slices.length > 0;

    const colors = slices.map(
        (s, i) => ROLE_COLORS[s.role] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    );

    const options: ApexOptions = {
        chart: { fontFamily: 'Manrope, sans-serif', toolbar: { show: false } },
        labels: slices.map((s) => s.role),
        colors,
        legend: { position: 'bottom', fontSize: '11px', labels: { colors: '#7B91B0' } },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        tooltip: { y: { formatter: (v: number) => formatMinorAmount(v, currency) } },
        plotOptions: { pie: { donut: { size: '68%' } } },
    };

    return (
        <ChartCard
            title="Royalties by role"
            subtitle="Net creator royalties allocated across split roles"
            headline={data ? formatMinorAmount(data.totalNetMinor, currency) : undefined}
            headlineCaption={
                data
                    ? `${formatCount(data.creatorCount)} creators · ${formatCount(data.earningCount)} earnings`
                    : undefined
            }
            loading={loading}
            empty={!hasData}
            emptyText="No royalties allocated in this window yet."
            minH="240px"
        >
            <ReactApexChart
                options={options}
                series={slices.map((s) => s.allocatedMinor)}
                type="donut"
                height={240}
            />
        </ChartCard>
    );
};
