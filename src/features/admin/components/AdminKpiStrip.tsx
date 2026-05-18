import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { KpiCard } from '@/features/record-label/components/KpiCard';
import { formatCount } from '../lib/format';
import type { AdminOverviewDto } from '../types';

interface AdminKpiStripProps {
    overview: AdminOverviewDto;
}

/** Six platform-health KPI cards across the top of the admin overview. */
export const AdminKpiStrip: React.FC<AdminKpiStripProps> = ({ overview }) => {
    const pct = overview.signupsTrendPct ?? 0;

    return (
        <SimpleGrid columns={{ base: 2, md: 3, xl: 6 }} gap={3}>
            <KpiCard
                bg="#FFF5F6"
                iconColor="primary.500"
                label="Total Users"
                value={formatCount(overview.totalUsers)}
            />
            <KpiCard
                bg="#FFF9E6"
                iconColor="#D97706"
                label="Pending Verifications"
                value={formatCount(overview.pendingVerifications)}
            />
            <KpiCard
                bg="#ECF7FF"
                iconColor="#3B82F6"
                label="Open Support Tickets"
                value={formatCount(overview.openTickets)}
            />
            <KpiCard
                bg="#FEF2F2"
                iconColor="#E53E3E"
                label="Flagged Content"
                value={formatCount(overview.flaggedContent)}
            />
            <KpiCard
                bg="#F6F1FF"
                iconColor="#7C3AED"
                label="New Signups (30d)"
                value={formatCount(overview.newSignups30d)}
                trend={{ deltaPct: Math.abs(pct), isPositive: pct >= 0 }}
                trendCaption="vs last 30d"
            />
            <KpiCard
                bg="#E7FFF7"
                iconColor="#16A34A"
                label="Active Subscriptions"
                value={formatCount(overview.activeSubscriptions)}
            />
        </SimpleGrid>
    );
};
