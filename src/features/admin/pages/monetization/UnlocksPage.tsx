import React from 'react';
import { Text } from '@chakra-ui/react';
import { FiUnlock } from 'react-icons/fi';
import { AdminError, AdminPageLayout, DataTable, FilterBar, StatusBadge } from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { IdentityCell } from '../../components/ui';
import { adminDateTime, formatCount } from '../../lib/format';
import { useFinanceUnlocks } from '../../hooks/useFinance';
import type { FinanceUnlock, UnlockQuery } from '../../types/finance';

const PAGE_SIZE = 20;

const KIND_OPTIONS = [
    { value: 'All', label: 'All kinds' },
    { value: 'Track', label: 'Track' },
    { value: 'Video', label: 'Video' },
    { value: 'Airtime', label: 'Airtime' },
];

/** Unlocks ledger — reuses the finance unlocks feed. */
const UnlocksPage: React.FC = () => {
    const [query, setQuery] = React.useState<UnlockQuery>({ page: 1, pageSize: PAGE_SIZE });
    const { data, isLoading, error } = useFinanceUnlocks(query);

    const columns: DataColumn<FinanceUnlock>[] = [
        {
            key: 'user',
            header: 'User',
            render: (u) => <IdentityCell name={u.userDisplayName} />,
        },
        {
            key: 'kind',
            header: 'Kind',
            render: (u) => (
                <Text fontSize="xs" color="gray.700">
                    {u.kind}
                </Text>
            ),
        },
        {
            key: 'content',
            header: 'Content',
            render: (u) => (
                <Text fontSize="xs" color="gray.700" lineClamp={1}>
                    {u.contentTitle ?? u.trackId ?? u.videoId ?? u.phoneNumber ?? '—'}
                </Text>
            ),
        },
        {
            key: 'coins',
            header: 'Coins',
            align: 'right',
            render: (u) => (
                <Text fontSize="xs" fontWeight="semibold" color="gray.800">
                    {u.coinsSpent != null ? formatCount(u.coinsSpent) : '—'}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (u) => (u.status ? <StatusBadge status={u.status} /> : <Text fontSize="11px" color="gray.400">—</Text>),
        },
        {
            key: 'date',
            header: 'Date',
            render: (u) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDateTime(u.createdAt)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Unlocks"
            subtitle="Coin-funded content unlocks (tracks, videos) and airtime conversions."
            breadcrumbs={[{ label: 'Monetization' }, { label: 'Unlocks' }]}
        >
            <FilterBar
                filters={[
                    {
                        key: 'kind',
                        value: query.kind ?? 'All',
                        onChange: (v) =>
                            setQuery((q) => ({ ...q, kind: v === 'All' ? undefined : v, page: 1 })),
                        options: KIND_OPTIONS,
                        width: '160px',
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message="Could not load unlocks." />
            ) : (
                <DataTable
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(u) => u.id}
                    loading={isLoading && !data}
                    emptyIcon={FiUnlock}
                    emptyTitle="No unlocks"
                    emptyDescription="No unlocks match the current filters."
                    pagination={
                        data
                            ? {
                                  page: data.page,
                                  pageSize: data.pageSize,
                                  total: data.total,
                                  onPageChange: (page) => setQuery((q) => ({ ...q, page })),
                              }
                            : undefined
                    }
                />
            )}
        </AdminPageLayout>
    );
};

export default UnlocksPage;
