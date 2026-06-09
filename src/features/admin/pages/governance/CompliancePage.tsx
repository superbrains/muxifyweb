import React from 'react';
import { Text } from '@chakra-ui/react';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    KpiStrip,
} from '../../components/ui';
import type { KpiItem } from '../../components/ui';
import { adminDateTime, formatCount } from '../../lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useCompliance } from '../../hooks/useGovernance';
import type { ComplianceSummaryDto } from '../../types/governance';
import { NoAccess } from './NoAccess';

/** Danger tint when a count signals an open risk; otherwise the neutral palette. */
interface Tint {
    bg?: string;
    iconColor?: string;
}
const DANGER: Tint = { bg: '#FEF2F2', iconColor: '#E53E3E' };
const NEUTRAL: Tint = {};

/**
 * Compliance — a 9-metric snapshot of the platform's outstanding risk &
 * governance work (`GET /admin/governance/compliance`). Counts that should be
 * zero (disputes, frozen splits, restricted tracks, pending finance approvals)
 * turn red when non-zero. Gated on `ComplianceView`.
 */
const CompliancePage: React.FC = () => {
    const canView = useHasPermission('ComplianceView');
    const { data, isLoading, error } = useCompliance();

    const items: KpiItem[] = React.useMemo(() => {
        if (!data) return [];
        const danger = (n: number) => (n > 0 ? DANGER : NEUTRAL);
        const c: ComplianceSummaryDto = data;
        const make = (label: string, n: number, tint: Tint): KpiItem => ({
            label,
            value: formatCount(n),
            bg: tint.bg,
            iconColor: tint.iconColor,
        });
        return [
            make('Pending artist verifications', c.pendingArtistVerifications, NEUTRAL),
            make('Pending label verifications', c.pendingLabelVerifications, NEUTRAL),
            make('Pending advertiser verifications', c.pendingAdvertiserVerifications, NEUTRAL),
            make('Open disputes', c.openDisputes, danger(c.openDisputes)),
            make('Frozen splits', c.frozenSplits, danger(c.frozenSplits)),
            make('Restricted tracks', c.restrictedTracks, danger(c.restrictedTracks)),
            make('Pending content reports', c.pendingContentReports, NEUTRAL),
            make('Suspended users', c.suspendedUsers, NEUTRAL),
            make(
                'Pending finance approvals',
                c.pendingFinanceApprovals,
                danger(c.pendingFinanceApprovals),
            ),
        ];
    }, [data]);

    return (
        <AdminPageLayout
            title="Compliance"
            subtitle="A live snapshot of outstanding verification, moderation and financial-risk work."
            breadcrumbs={[{ label: 'Support & Governance' }, { label: 'Compliance' }]}
        >
            {!canView ? (
                <NoAccess description="This area requires the compliance view permission." />
            ) : error ? (
                <AdminError error={error} message="Could not load the compliance summary." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : (
                <>
                    <KpiStrip items={items} columns={{ base: 2, md: 3, xl: 3 }} />
                    {data && (
                        <Text fontSize="11px" color="gray.400">
                            Generated {adminDateTime(data.generatedAt)}
                        </Text>
                    )}
                </>
            )}
        </AdminPageLayout>
    );
};

export default CompliancePage;
