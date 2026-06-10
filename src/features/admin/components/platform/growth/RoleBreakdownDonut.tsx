import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { formatCount } from '../../../lib/format';
import type { GrowthRoleBreakdown } from '../../../types/platform';
import { ChartCard } from '../ChartCard';

const COLORS = ['#7C3AED', '#3B82F6', '#16A34A', '#D97706', '#E53E3E', '#0EA5E9', '#94A3B8'];

const TOP_N = 6;

/** "RecordLabel" → "Record Label", "super_admin" → "super admin". */
export const humanizeRole = (role: string): string =>
    role.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');

interface RoleBreakdownDonutProps {
    byRole: GrowthRoleBreakdown[];
    loading: boolean;
}

/** How the window's signups split across user roles (fans, artists, labels…). */
export const RoleBreakdownDonut: React.FC<RoleBreakdownDonutProps> = ({ byRole, loading }) => {
    const sorted = [...byRole].filter((r) => r.count > 0).sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, TOP_N);
    const restCount = sorted.slice(TOP_N).reduce((sum, r) => sum + r.count, 0);
    const slices = restCount > 0 ? [...top, { role: 'Other', count: restCount }] : top;
    const hasData = slices.length > 0;

    const options: ApexOptions = {
        chart: { fontFamily: 'Manrope, sans-serif', toolbar: { show: false } },
        labels: slices.map((s) => humanizeRole(s.role)),
        colors: COLORS,
        legend: { position: 'bottom', fontSize: '11px', labels: { colors: '#7B91B0' } },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        tooltip: { y: { formatter: (v: number) => `${formatCount(v)} signups` } },
        plotOptions: { pie: { donut: { size: '68%' } } },
    };

    return (
        <ChartCard
            title="Signups by role"
            subtitle="Where the window's new accounts came from"
            headline={hasData ? humanizeRole(slices[0].role) : undefined}
            headlineCaption={hasData ? `${formatCount(slices[0].count)} signups` : undefined}
            loading={loading}
            empty={!hasData}
            emptyText="No signups recorded in this window yet."
            minH="240px"
        >
            <ReactApexChart
                options={options}
                series={slices.map((s) => s.count)}
                type="donut"
                height={240}
            />
        </ChartCard>
    );
};
