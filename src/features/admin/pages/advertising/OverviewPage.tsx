import React from 'react';
import { Text } from '@chakra-ui/react';
import { FiTarget } from 'react-icons/fi';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    DataTable,
    KpiStrip,
    StatusBadge,
} from '@shared/console';
import type { DataColumn, KpiItem } from '@shared/console';
import { formatCount, formatMinorAmount } from '@shared/console/lib/format';
import { useHasPermission } from '../../hooks/useAdminManagement';
import { useAdOverview } from '../../hooks/useAdvertising';
import type { AdStatusCountDto } from '../../types/advertising';
import { NoAccess } from './NoAccess';

/** Advertising overview — KPI strip plus a status breakdown table. */
const OverviewPage: React.FC = () => {
    const canView = useHasPermission('AdvertisingView');
    const { data, isLoading, error } = useAdOverview();
    const currency = data?.currency ?? 'NGN';

    const kpis: KpiItem[] = [
        { label: 'Total campaigns', value: formatCount(data?.totalCampaigns) },
        { label: 'Active campaigns', value: formatCount(data?.activeCampaigns) },
        { label: 'Pending approval', value: formatCount(data?.pendingApprovalCount) },
        { label: 'Total spend', value: formatMinorAmount(data?.totalSpendMinor, currency) },
        { label: 'Wallet balance', value: formatMinorAmount(data?.totalWalletBalanceMinor, currency) },
        { label: 'Advertisers', value: formatCount(data?.advertiserCount) },
        { label: 'Impressions', value: formatCount(data?.totalImpressions) },
        { label: 'Clicks', value: formatCount(data?.totalClicks) },
        { label: 'Avg CTR', value: `${((data?.avgCtr ?? 0)).toFixed(2)}%` },
    ];

    const columns: DataColumn<AdStatusCountDto>[] = [
        {
            key: 'status',
            header: 'Status',
            render: (r) => <StatusBadge status={r.status} />,
        },
        {
            key: 'count',
            header: 'Campaigns',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" color="gray.700">
                    {formatCount(r.count)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Advertising Overview"
            subtitle="Platform-wide advertising health — campaigns, spend, wallets and engagement."
            breadcrumbs={[{ label: 'Advertising' }, { label: 'Overview' }]}
        >
            {!canView ? (
                <NoAccess />
            ) : error ? (
                <AdminError error={error} message="Could not load the advertising overview." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : (
                <>
                    <KpiStrip items={kpis} />
                    <DataTable
                        columns={columns}
                        rows={data?.byStatus ?? []}
                        rowKey={(r) => r.status}
                        emptyIcon={FiTarget}
                        emptyTitle="No campaigns"
                        emptyDescription="No campaigns exist yet."
                    />
                </>
            )}
        </AdminPageLayout>
    );
};

export default OverviewPage;
