import React from 'react';
import { AdminPageLayout, AdminError, AdminLoading, KpiStrip } from '../../components/ui';
import type { KpiItem } from '../../components/ui';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { formatCount } from '../../lib/format';
import { useRiskCompliance } from '../../hooks/usePlatform';

/** Tower 31 — a snapshot of the platform's open risk/compliance exposure. */
const RiskCompliancePage: React.FC = () => {
    const { data, isLoading, error } = useRiskCompliance();

    const items: KpiItem[] = data
        ? [
              { label: 'Pending Verifications', value: formatCount(data.pendingVerifications) },
              { label: 'Flagged Content', value: formatCount(data.flaggedContent) },
              { label: 'Failed Payouts', value: formatCount(data.failedPayouts) },
              { label: 'Suspended Users', value: formatCount(data.suspendedUsers) },
              { label: 'Pending Withdrawals', value: formatCount(data.pendingWithdrawals) },
              { label: 'Pending Finance Approvals', value: formatCount(data.pendingFinanceApprovals) },
          ]
        : [];

    return (
        <AdminPageLayout
            title="Risk & Compliance"
            subtitle="Open exposure across verifications, moderation, payouts and approvals"
            breadcrumbs={[{ label: 'Platform' }, { label: 'Risk & Compliance' }]}
        >
            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message={getApiErrorMessage(error, 'Could not load risk snapshot.')} />
            ) : (
                <KpiStrip items={items} columns={{ base: 2, md: 3, xl: 6 }} />
            )}
        </AdminPageLayout>
    );
};

export default RiskCompliancePage;
