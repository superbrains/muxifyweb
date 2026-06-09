import React from 'react';
import { Text } from '@chakra-ui/react';
import { FiClock } from 'react-icons/fi';
import {
    AdminError,
    AdminPageLayout,
    DataTable,
    FilterBar,
    IdentityCell,
    StatusBadge,
} from '../../components/ui';
import type { DataColumn } from '../../components/ui';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { adminDateTime, formatMinorAmount } from '../../lib/format';
import { financeStatusStyle } from '../../lib/financeStatusColor';
import { usePayouts } from '../../hooks/useFinance';
import type { PayoutListItem, PayoutQuery } from '../../types/finance';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Failed', label: 'Failed' },
    { value: 'Cancelled', label: 'Cancelled' },
];

/** Completed / historical payouts — the settled-payout ledger. */
const HistoryPage: React.FC = () => {
    const [query, setQuery] = React.useState<PayoutQuery>({
        page: 1,
        pageSize: PAGE_SIZE,
        status: 'Completed',
    });
    const { data, isLoading, error } = usePayouts(query);

    const patch = (next: Partial<PayoutQuery>) => setQuery((q) => ({ ...q, ...next, page: 1 }));

    const columns: DataColumn<PayoutListItem>[] = [
        {
            key: 'recipient',
            header: 'Recipient',
            render: (p) => <IdentityCell name={p.recipientName} secondary={p.recipientRole} size="xs" />,
        },
        {
            key: 'amount',
            header: 'Net amount',
            align: 'right',
            render: (p) => (
                <Text fontSize="xs" fontWeight="semibold">
                    {formatMinorAmount(p.netAmountMinor, p.currency)}
                </Text>
            ),
        },
        {
            key: 'reference',
            header: 'Reference',
            render: (p) => (
                <Text fontSize="xs" color="gray.600" fontFamily="mono">
                    {p.reference ?? '—'}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (p) => <StatusBadge style={financeStatusStyle(p.status)} />,
        },
        {
            key: 'initiated',
            header: 'Initiated',
            render: (p) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDateTime(p.initiatedAt)}
                </Text>
            ),
        },
        {
            key: 'completed',
            header: 'Completed',
            render: (p) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDateTime(p.completedAt)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Payout History"
            subtitle="Completed and historical payouts across the platform."
            breadcrumbs={[{ label: 'Payouts' }, { label: 'History' }]}
        >
            <FilterBar
                filters={[
                    {
                        key: 'status',
                        value: query.status ?? 'All',
                        onChange: (v) => patch({ status: v === 'All' ? undefined : v }),
                        options: STATUS_OPTIONS,
                    },
                ]}
            />

            {error ? (
                <AdminError error={error} message={getApiErrorMessage(error)} />
            ) : (
                <DataTable<PayoutListItem>
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(p) => p.id}
                    loading={isLoading && !data}
                    emptyIcon={FiClock}
                    emptyTitle="No payouts"
                    emptyDescription="No payouts match the current filters."
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

export default HistoryPage;
