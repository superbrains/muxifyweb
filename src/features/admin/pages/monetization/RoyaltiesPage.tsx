import React from 'react';
import { Text } from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import {
    AdminError,
    AdminLoading,
    AdminPageLayout,
    DataTable,
    FilterBar,
    KpiStrip,
} from '../../components/ui';
import type { DataColumn, KpiItem } from '../../components/ui';
import { formatCount, formatMinorAmount } from '../../lib/format';
import { useRoyalties } from '../../hooks/useMonetization';
import type { DateRangeQuery, RoyaltiesByRoleDto } from '../../types/monetization';
import { RANGE_OPTIONS, rangeFor } from './rangeFilter';

/** Royalties summary — net creator royalties allocated, by recipient role. */
const RoyaltiesPage: React.FC = () => {
    const [preset, setPreset] = React.useState('30d');
    const range: DateRangeQuery = React.useMemo(() => rangeFor(preset), [preset]);
    const { data, isLoading, error } = useRoyalties(range);

    const currency = data?.currency ?? 'NGN';

    const kpis: KpiItem[] = [
        { label: 'Net royalties', value: formatMinorAmount(data?.totalNetMinor, currency) },
        { label: 'Net coins', value: formatCount(data?.totalNetCoins) },
        { label: 'Creators', value: formatCount(data?.creatorCount) },
        { label: 'Earnings counted', value: formatCount(data?.earningCount) },
    ];

    const columns: DataColumn<RoyaltiesByRoleDto>[] = [
        {
            key: 'role',
            header: 'Role',
            render: (r) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                    {r.role}
                </Text>
            ),
        },
        {
            key: 'allocated',
            header: 'Allocated',
            align: 'right',
            render: (r) => (
                <Text fontSize="xs" color="gray.700">
                    {formatMinorAmount(r.allocatedMinor, currency)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Royalties"
            subtitle="Net royalties allocated to creators and contributors, broken down by role."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Royalties' }]}
        >
            <FilterBar
                filters={[
                    {
                        key: 'range',
                        value: preset,
                        onChange: setPreset,
                        options: RANGE_OPTIONS,
                        width: '170px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load royalties." />
            ) : isLoading && !data ? (
                <AdminLoading />
            ) : (
                <>
                    <KpiStrip items={kpis} />
                    <DataTable
                        columns={columns}
                        rows={data?.byRole ?? []}
                        rowKey={(r) => r.role}
                        emptyIcon={FiUsers}
                        emptyTitle="No royalties"
                        emptyDescription="No royalties allocated in the selected window."
                    />
                </>
            )}
        </AdminPageLayout>
    );
};

export default RoyaltiesPage;
