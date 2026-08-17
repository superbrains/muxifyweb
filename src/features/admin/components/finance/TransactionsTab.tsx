import React from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { Select } from '@shared/components';
import { AdminTable, type AdminTableColumn } from '../AdminTable';
import { Paginator } from '@shared/console/components/Paginator';
import { AdminLoading, AdminError } from '@shared/console/components/AdminStateBlock';
import { StatusBadge } from '../StatusBadge';
import { IdentityCell } from '@shared/console/components/IdentityCell';
import { getApiErrorMessage } from '@/shared/lib/errorUtils';
import { adminDateTime, formatCount } from '@shared/console/lib/format';
import { financeStatusStyle, transactionTypeStyle } from '../../lib/financeStatusColor';
import { exportCsv } from '@shared/console/lib/exportCsv';
import { useFinanceTransactions } from '../../hooks/useFinance';
import type { FinanceTransaction, TransactionQuery } from '../../types/finance';
import { DateRangeFilter, ExportButton, SearchInput, ToolbarCard } from './FinanceFilters';
import { TransactionDetailDrawer } from './TransactionDetailDrawer';

const PAGE_SIZE = 15;

const TYPE_OPTIONS = [
    { value: 'All', label: 'All types' },
    { value: 'Purchase', label: 'Funding' },
    { value: 'ContentUnlock', label: 'Unlock' },
    { value: 'GiftSent', label: 'Gift sent' },
    { value: 'GiftReceived', label: 'Gift received' },
    { value: 'TransferIn', label: 'Transfer in' },
    { value: 'TransferOut', label: 'Transfer out' },
    { value: 'Refund', label: 'Refund' },
    { value: 'Bonus', label: 'Bonus' },
    { value: 'AdminCredit', label: 'Admin credit' },
    { value: 'AdminDebit', label: 'Admin debit' },
];

const DIRECTION_OPTIONS = [
    { value: 'All', label: 'All directions' },
    { value: 'credit', label: 'Credits' },
    { value: 'debit', label: 'Debits' },
];

export function TransactionsTab() {
    const [query, setQuery] = React.useState<TransactionQuery>({ page: 1, pageSize: PAGE_SIZE, sort: 'newest' });
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const { data, isLoading, error } = useFinanceTransactions(query);

    const patch = (next: Partial<TransactionQuery>) => setQuery((q) => ({ ...q, ...next, page: 1 }));

    const columns: AdminTableColumn<FinanceTransaction>[] = [
        {
            key: 'user',
            header: 'User',
            render: (t) => <IdentityCell name={t.userDisplayName} secondary={t.userEmail ?? undefined} size="xs" />,
        },
        {
            key: 'type',
            header: 'Type',
            render: (t) => <StatusBadge style={transactionTypeStyle(t.type, t.isCredit)} />,
        },
        {
            key: 'amount',
            header: 'Amount',
            align: 'right',
            render: (t) => (
                <Text fontSize="xs" fontWeight="semibold" color={t.isCredit ? '#0F7B5C' : '#C53030'}>
                    {t.isCredit ? '+' : '-'}
                    {formatCount(t.amount)}
                </Text>
            ),
        },
        {
            key: 'balance',
            header: 'Balance',
            align: 'right',
            render: (t) => <Text fontSize="xs" color="gray.500">{formatCount(t.balanceAfter)}</Text>,
        },
        {
            key: 'status',
            header: 'Status',
            render: (t) => (t.status ? <StatusBadge style={financeStatusStyle(t.status)} /> : <Text color="gray.400">—</Text>),
        },
        {
            key: 'date',
            header: 'Date',
            render: (t) => <Text fontSize="xs" color="gray.500">{adminDateTime(t.transactionDate)}</Text>,
        },
    ];

    const handleExport = () => {
        const rows = data?.items ?? [];
        exportCsv<FinanceTransaction>('transactions', [
            { header: 'Date', value: (t) => adminDateTime(t.transactionDate) },
            { header: 'User', value: (t) => t.userDisplayName },
            { header: 'Email', value: (t) => t.userEmail ?? '' },
            { header: 'Type', value: (t) => t.type },
            { header: 'Direction', value: (t) => (t.isCredit ? 'Credit' : 'Debit') },
            { header: 'Amount (coins)', value: (t) => t.amount },
            { header: 'Balance after', value: (t) => t.balanceAfter },
            { header: 'Status', value: (t) => t.status ?? '' },
            { header: 'Description', value: (t) => t.description ?? '' },
        ], rows);
    };

    return (
        <VStack align="stretch" gap={3}>
            <ToolbarCard>
                <SearchInput value={query.search ?? ''} onChange={(v) => patch({ search: v || undefined })} placeholder="Search description or user…" />
                <Select options={TYPE_OPTIONS} value={query.type ?? 'All'} onChange={(v) => patch({ type: v === 'All' ? undefined : v })} width="150px" fontSize="xs" />
                <Select options={DIRECTION_OPTIONS} value={query.direction ?? 'All'} onChange={(v) => patch({ direction: v === 'All' ? undefined : v })} width="140px" fontSize="xs" />
                <DateRangeFilter range={query} onChange={(r) => patch(r)} />
                <ExportButton onClick={handleExport} disabled={!data?.items.length} />
            </ToolbarCard>

            {isLoading && !data ? (
                <AdminLoading />
            ) : error ? (
                <AdminError error={error} message={getApiErrorMessage(error)} />
            ) : (
                <>
                    <AdminTable<FinanceTransaction>
                        columns={columns}
                        rows={data?.items ?? []}
                        rowKey={(t) => t.id}
                        onRowClick={(t) => setSelectedId(t.id)}
                        emptyTitle="No transactions"
                        emptyDescription="Adjust the filters to see more."
                    />
                    <Paginator
                        page={data?.page ?? 1}
                        pageSize={data?.pageSize ?? PAGE_SIZE}
                        total={data?.total ?? 0}
                        onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
                    />
                </>
            )}

            <TransactionDetailDrawer id={selectedId} onClose={() => setSelectedId(null)} />
        </VStack>
    );
}
