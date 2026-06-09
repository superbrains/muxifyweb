import React from 'react';
import { Text } from '@chakra-ui/react';
import { FiCreditCard } from 'react-icons/fi';
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
import { adminDate } from '../../lib/format';
import { financeStatusStyle } from '../../lib/financeStatusColor';
import { usePayoutAccounts } from '../../hooks/useFinance';
import type { PayoutAccountDto, PayoutAccountQuery } from '../../types/finance';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { value: 'All', label: 'All statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Failed', label: 'Failed' },
];

/** Saved creator payout (bank) accounts — review their verification status. */
const AccountsPage: React.FC = () => {
    const [query, setQuery] = React.useState<PayoutAccountQuery>({ page: 1, pageSize: PAGE_SIZE });
    const { data, isLoading, error } = usePayoutAccounts(query);

    const patch = (next: Partial<PayoutAccountQuery>) =>
        setQuery((q) => ({ ...q, ...next, page: 1 }));

    const columns: DataColumn<PayoutAccountDto>[] = [
        {
            key: 'artist',
            header: 'Owner',
            render: (a) => (
                <IdentityCell name={a.artistName ?? '—'} secondary={a.nickname ?? undefined} size="xs" />
            ),
        },
        {
            key: 'bank',
            header: 'Bank',
            render: (a) => (
                <Text fontSize="xs" color="gray.700">
                    {a.bankName}
                </Text>
            ),
        },
        {
            key: 'accountName',
            header: 'Account name',
            render: (a) => (
                <Text fontSize="xs" color="gray.700">
                    {a.accountName}
                </Text>
            ),
        },
        {
            key: 'accountNumber',
            header: 'Account number',
            render: (a) => (
                <Text fontSize="xs" color="gray.600" fontFamily="mono">
                    {a.accountNumber ? `••••${a.accountNumber.slice(-4)}` : '—'}
                </Text>
            ),
        },
        {
            key: 'default',
            header: 'Default',
            render: (a) =>
                a.isDefault ? (
                    <StatusBadge status="Active" label="Default" />
                ) : (
                    <Text fontSize="xs" color="gray.400">
                        —
                    </Text>
                ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (a) => <StatusBadge style={financeStatusStyle(a.status)} />,
        },
        {
            key: 'verified',
            header: 'Verified',
            render: (a) => (
                <Text fontSize="xs" color="gray.500">
                    {adminDate(a.verifiedAt)}
                </Text>
            ),
        },
    ];

    return (
        <AdminPageLayout
            title="Payout Accounts"
            subtitle="Bank/payout destinations saved by creators and their verification state."
            breadcrumbs={[{ label: 'Payouts' }, { label: 'Accounts' }]}
        >
            <FilterBar
                search={{
                    value: query.search ?? '',
                    onChange: (v) => patch({ search: v || undefined }),
                    placeholder: 'Search owner, bank or account',
                }}
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
                <DataTable<PayoutAccountDto>
                    columns={columns}
                    rows={data?.items ?? []}
                    rowKey={(a) => a.id}
                    loading={isLoading && !data}
                    emptyIcon={FiCreditCard}
                    emptyTitle="No payout accounts"
                    emptyDescription="No payout accounts match the current filters."
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

export default AccountsPage;
